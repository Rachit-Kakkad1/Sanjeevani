"""
ocr_service.py — Production-grade OCR extraction pipeline for medical/financial bills.

Architecture:
  1. Image decode + engine-specific preprocessing
  2. OCR (EasyOCR primary, Tesseract fallback)
  3. Confidence filtering (reject low-quality boxes)
  4. Noise filtering (reject phone numbers, GSTIN, IDs)
  5. Layout parsing (cluster boxes into rows, detect columns)
  6. Intelligent extraction (context-aware price/qty detection)
  7. Validation (price range, sum cross-check, confidence scoring)

This pipeline prevents the #1 bug: extracting irrelevant numbers
(phone, GSTIN, invoice IDs) as prices, causing outputs like ₹50,200,015,794,873.
"""

import re
import logging
import numpy as np
import cv2

logger = logging.getLogger("medclear.ocr_service")

# ─── Import preprocessing (engine-specific paths) ─────────────────────────
from app.utils.image_preprocess import (
    preprocess_for_easyocr,
    preprocess_for_tesseract,
)

# ─── Import noise filtering ───────────────────────────────────────────────
from app.utils.noise_filter import (
    is_noise_text,
    is_noise_row,
    is_header_row,
    is_phone_number,
    is_account_number,
    is_hsn_code,
    is_serial_number,
    clean_price_text,
    extract_numeric_value,
    classify_number_context,
    PRICE_CONTEXT_KEYWORDS,
)

# ─── Import validation ────────────────────────────────────────────────────
from app.utils.validators import (
    validate_item_price,
    validate_total,
    validate_quantity,
    validate_sum_against_total,
    compute_confidence_score,
    sanitize_items,
    pick_best_total,
)

# ─── PDF support (optional) ───────────────────────────────────────────────
try:
    from pdf2image import convert_from_bytes
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

# ─── OCR Engines (singleton — loaded once at module import) ───────────────
try:
    import easyocr
    EASY_AVAILABLE = True
    _easyocr_reader = easyocr.Reader(['en'], gpu=False)
    logger.info("EasyOCR engine loaded successfully")
except Exception as e:
    EASY_AVAILABLE = False
    _easyocr_reader = None
    logger.warning(f"EasyOCR not available: {e}")

try:
    import pytesseract
    # Quick test to see if Tesseract binary is installed
    pytesseract.get_tesseract_version()
    TESSERACT_AVAILABLE = True
    logger.info("Tesseract engine loaded successfully")
except Exception as e:
    TESSERACT_AVAILABLE = False
    logger.warning(f"Tesseract not available: {e}")

# ─── Regex Patterns ───────────────────────────────────────────────────────

# Robust currency regex: supports ₹1,500.00, Rs. 1,00,000, $150.00
CURRENCY_REGEX = re.compile(
    r'(?:Rs\.?|INR|₹|\$)\s*[\d,]+(?:\.\d{1,2})?',
    re.IGNORECASE,
)

# Price-like number: digits with optional commas and decimal
# Must start with a digit, supports Indian format (1,00,000.00)
PRICE_NUMBER_REGEX = re.compile(
    r'^\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?$'
)

# Total keywords
TOTAL_KEYWORDS = re.compile(
    r'(?:Grand\s*Total|Net\s*Amount|Total\s*Payable|Total\s*Amount|'
    r'Payable\s*Amount|Subtotal|Sub\s*Total|TOTAL[:\s;]|'
    r'Net\s*Payable|Amount\s*Due|Balance\s*Due|'
    r'Taxes?\s*(?:&|and)?\s*Fees?)',
    re.IGNORECASE,
)

# Minimum OCR confidence thresholds
MIN_EASYOCR_CONFIDENCE = 0.4
MIN_TESSERACT_CONFIDENCE = 30  # Tesseract uses 0-100 scale


# ─── PDF Conversion ───────────────────────────────────────────────────────

def convert_pdf_to_images(pdf_bytes: bytes) -> np.ndarray:
    """Convert PDF bytes to a single vertically-concatenated OpenCV image."""
    if not PDF_AVAILABLE:
        raise Exception("POPPLER_MISSING: PDF processing requires Poppler")

    try:
        images = convert_from_bytes(pdf_bytes)
        combined_img = None
        for img in images:
            cv_img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
            if combined_img is None:
                combined_img = cv_img
            else:
                combined_img = cv2.vconcat([combined_img, cv_img])
        return combined_img
    except Exception as e:
        raise Exception(f"PDF conversion failed: {str(e)}")


# ─── OCR Engine Wrappers ──────────────────────────────────────────────────

def extract_with_easyocr(image: np.ndarray) -> list[dict] | None:
    """
    Run EasyOCR on a preprocessed image.
    Returns normalized box dicts with confidence filtering.
    """
    if not EASY_AVAILABLE or _easyocr_reader is None:
        return None

    try:
        # Use the engine-specific preprocessed image
        processed = preprocess_for_easyocr(image)
        raw_results = _easyocr_reader.readtext(processed)

        boxes = []
        for bbox, text, conf in raw_results:
            # ── Confidence gate: reject low-quality detections ──
            if conf < MIN_EASYOCR_CONFIDENCE:
                logger.debug(f"Rejected low-conf EasyOCR box: '{text}' (conf={conf:.2f})")
                continue

            text = text.strip()
            if not text:
                continue

            x_coords = [float(p[0]) for p in bbox]
            y_coords = [float(p[1]) for p in bbox]
            boxes.append({
                "text": text,
                "x_min": min(x_coords),
                "x_max": max(x_coords),
                "y_min": min(y_coords),
                "y_max": max(y_coords),
                "center_y": (min(y_coords) + max(y_coords)) / 2,
                "conf": float(conf),
            })

        logger.info(f"EasyOCR: {len(raw_results)} raw → {len(boxes)} after confidence filter")
        return boxes if boxes else None
    except Exception as e:
        logger.error(f"EasyOCR extraction failed: {e}")
        return None


def extract_with_tesseract(image: np.ndarray) -> list[dict] | None:
    """
    Run Tesseract on a preprocessed image.
    Returns normalized box dicts with confidence filtering.
    """
    if not TESSERACT_AVAILABLE:
        return None

    try:
        # Use the engine-specific preprocessed image
        processed = preprocess_for_tesseract(image)
        data = pytesseract.image_to_data(processed, output_type=pytesseract.Output.DICT)

        boxes = []
        for i in range(len(data['text'])):
            conf = int(data['conf'][i])
            # ── Confidence gate ──
            if conf < MIN_TESSERACT_CONFIDENCE:
                continue

            text = data['text'][i].strip()
            if not text:
                continue

            x_min = data['left'][i]
            y_min = data['top'][i]
            w = data['width'][i]
            h = data['height'][i]

            boxes.append({
                "text": text,
                "x_min": x_min,
                "x_max": x_min + w,
                "y_min": y_min,
                "y_max": y_min + h,
                "center_y": y_min + h / 2,
                "conf": conf / 100.0,
            })

        logger.info(f"Tesseract: {len(boxes)} boxes after confidence filter")
        return boxes if boxes else None
    except Exception as e:
        logger.error(f"Tesseract extraction failed: {e}")
        return None


# ─── Layout Parsing ───────────────────────────────────────────────────────

def cluster_into_rows(boxes: list[dict], y_tolerance: int = 35) -> list[list[dict]]:
    """
    Group bounding boxes into rows using Y-coordinate clustering.
    Within each row, sort boxes left-to-right to reconstruct reading order.
    """
    if not boxes:
        return []

    boxes.sort(key=lambda b: b['center_y'])
    rows = []
    current_row = [boxes[0]]

    for i in range(1, len(boxes)):
        # Compare against the AVERAGE center_y of current row for stability
        avg_center = sum(b['center_y'] for b in current_row) / len(current_row)
        if abs(boxes[i]['center_y'] - avg_center) < y_tolerance:
            current_row.append(boxes[i])
        else:
            rows.append(sorted(current_row, key=lambda b: b['x_min']))
            current_row = [boxes[i]]

    rows.append(sorted(current_row, key=lambda b: b['x_min']))
    return rows


def detect_column_positions(header_row: list[dict]) -> dict:
    """
    Detect table column positions from a header row.
    Returns a dict mapping column type to x-coordinate range.
    """
    columns = {}
    for box in header_row:
        text_lower = box['text'].lower().strip()
        center_x = (box['x_min'] + box['x_max']) / 2

        if any(kw in text_lower for kw in ['description', 'particular', 'item', 'product', 'name']):
            columns['name'] = {'center_x': center_x, 'x_min': box['x_min'], 'x_max': box['x_max']}
        elif any(kw in text_lower for kw in ['qty', 'quantity', 'quanity']):
            columns['qty'] = {'center_x': center_x, 'x_min': box['x_min'], 'x_max': box['x_max']}
        elif any(kw in text_lower for kw in ['unit price', 'rate', 'price', 'mrp']):
            columns['unit_price'] = {'center_x': center_x, 'x_min': box['x_min'], 'x_max': box['x_max']}
        elif any(kw in text_lower for kw in ['total', 'amount', 'cost']):
            columns['total'] = {'center_x': center_x, 'x_min': box['x_min'], 'x_max': box['x_max']}

    return columns


def find_closest_column(box: dict, columns: dict, tolerance: int = 100) -> str | None:
    """
    Find which column a box belongs to based on x-coordinate alignment.
    """
    box_center_x = (box['x_min'] + box['x_max']) / 2
    best_col = None
    best_dist = tolerance

    for col_name, col_pos in columns.items():
        dist = abs(box_center_x - col_pos['center_x'])
        if dist < best_dist:
            best_dist = dist
            best_col = col_name

    return best_col


# ─── Intelligent Extraction ──────────────────────────────────────────────

def parse_line_items(rows: list[list[dict]]) -> tuple[list[dict], list[float]]:
    """
    Extract structured items and total candidates from OCR rows.

    Defence layers applied at each step:
    1. Skip noise rows (GSTIN, phone, address)
    2. Skip header rows (column definitions)
    3. Filter noise text per box (phone numbers, IDs)
    4. Use positional heuristics for price vs quantity
    5. Validate price ranges

    Returns:
        (items, total_candidates)
    """
    items = []
    total_candidates = []
    columns = {}  # Detected column positions from header row
    noise_filtered = []

    logger.info(f"Processing {len(rows)} rows")

    for row_idx, row in enumerate(rows):
        line_text = " ".join(b['text'] for b in row)
        avg_conf = sum(b['conf'] for b in row) / len(row) if row else 0

        # ── Layer 1: Skip noise rows ──
        if is_noise_row(line_text):
            noise_filtered.append(line_text)
            logger.debug(f"Row {row_idx}: NOISE — '{line_text[:60]}'")
            continue

        # ── Layer 2: Detect & skip header rows (but save column positions) ──
        if is_header_row(line_text):
            columns = detect_column_positions(row)
            logger.debug(f"Row {row_idx}: HEADER — detected columns: {list(columns.keys())}")
            continue

        # ── Layer 3: Check for total keywords ──
        if TOTAL_KEYWORDS.search(line_text):
            # Extract price candidates from this total row
            for box in row:
                val = _extract_price_from_box(box, line_text)
                if val is not None and validate_total(val):
                    total_candidates.append(val)
                    logger.debug(f"Row {row_idx}: TOTAL candidate — {val}")
            continue

        # ── Layer 4: Extract line item ──
        item = _extract_item_from_row(row, columns, avg_conf)
        if item:
            items.append(item)
            logger.debug(f"Row {row_idx}: ITEM — '{item['rawName']}' price={item['price']} qty={item['quantity']}")

    return items, total_candidates


def _extract_price_from_box(box: dict, row_text: str) -> float | None:
    """
    Extract a numeric price value from a single OCR box.
    Applies noise filtering before accepting the value.
    """
    text = box['text'].strip()

    # Reject noise patterns
    if is_noise_text(text):
        return None
    if is_phone_number(text):
        return None
    if is_account_number(text):
        return None

    # Try to extract numeric value
    val = extract_numeric_value(text)
    if val is None:
        return None

    # Reject values that look like HSN codes
    cleaned = clean_price_text(text).replace(',', '')
    if is_hsn_code(cleaned, row_text):
        return None

    return val


def _extract_item_from_row(
    row: list[dict],
    columns: dict,
    avg_conf: float,
) -> dict | None:
    """
    Extract a structured item from a row of OCR boxes.

    Strategy:
    - If column positions are known: use alignment to determine name/qty/price
    - If not: use positional heuristics (text=left, numbers=right)
    """
    line_text = " ".join(b['text'] for b in row)

    # Skip rows that are purely numeric (no item name)
    has_text = False
    for b in row:
        cleaned = clean_price_text(b['text']).replace(',', '')
        if not cleaned.replace('.', '').isdigit() and len(b['text'].strip()) > 1:
            has_text = True
            break

    if not has_text:
        return None

    # Calculate row x-extent for position ratios
    row_x_min = min(b['x_min'] for b in row)
    row_x_max = max(b['x_max'] for b in row)
    row_width = max(row_x_max - row_x_min, 1)

    name_parts = []
    prices = []
    quantity = 1
    price = None

    if columns:
        # ── Column-aligned extraction ──
        name_parts, quantity, price = _extract_with_columns(row, columns, line_text)
    else:
        # ── Heuristic extraction ──
        name_parts, quantity, price = _extract_with_heuristics(row, row_x_min, row_width, line_text)

    name = " ".join(name_parts).strip().strip('|').strip()

    # Validate extracted name
    if not name or len(name) < 2:
        return None
    if name.replace('.', '').replace('-', '').replace(' ', '').isdigit():
        return None
    # Skip if name is actually a column header
    name_lower = name.lower()
    if name_lower in ['description', 'quantity', 'unit price', 'total cost', 'quanity',
                       'amount', 'rate', 'particulars', 'sr no', 'hsn']:
        return None

    if price is None or price <= 0:
        return None

    # Validate price range
    if not validate_item_price(price):
        logger.debug(f"Rejected item '{name}' — price {price} out of valid range")
        return None

    # Validate quantity
    if not validate_quantity(quantity):
        quantity = 1

    return {
        "rawName": name,
        "price": round(price, 2),
        "quantity": quantity,
        "confidence": round(avg_conf, 2),
    }


def _extract_with_columns(
    row: list[dict],
    columns: dict,
    line_text: str,
) -> tuple[list[str], int, float | None]:
    """Extract item data using detected column positions."""
    name_parts = []
    quantity = 1
    unit_price = None
    line_total = None

    for box_idx, box in enumerate(row):
        text = box['text'].strip()
        col = find_closest_column(box, columns)

        if col == 'name':
            if not is_serial_number(text, box_idx):
                name_parts.append(text)
        elif col == 'qty':
            val = extract_numeric_value(text)
            if val is not None and 1 <= val <= 9999:
                quantity = int(val)
        elif col == 'unit_price':
            val = _extract_price_from_box(box, line_text)
            if val is not None:
                unit_price = val
        elif col == 'total':
            val = _extract_price_from_box(box, line_text)
            if val is not None:
                line_total = val
        elif col is None:
            # Unaligned box — classify by content
            val = extract_numeric_value(text)
            if val is None:
                # Text → probably part of name
                if not is_noise_text(text):
                    name_parts.append(text)
            elif validate_item_price(val):
                if line_total is None:
                    line_total = val

    # Decide which price to use:
    # If we have the line_total column, use it as price with qty=1
    # (because line_total already = unit_price * qty)
    # If only unit_price, use it with the detected quantity
    if line_total is not None:
        price = line_total
        quantity = 1  # line_total already accounts for quantity
    elif unit_price is not None:
        price = unit_price
        # keep quantity as detected
    else:
        price = None

    return name_parts, quantity, price


def _extract_with_heuristics(
    row: list[dict],
    row_x_min: float,
    row_width: float,
    line_text: str,
) -> tuple[list[str], int, float | None]:
    """
    Extract item data using positional heuristics when no column headers detected.

    Heuristic: In a typical bill row like "X-Ray Chest  1  $150.00  $150.00"
    - Text on the LEFT → item name
    - Numbers in the MIDDLE → quantity (if small integer)
    - Numbers on the RIGHT → price (largest valid one is the line total)
    """
    name_parts = []
    quantity = 1
    price_candidates = []

    for box_idx, box in enumerate(row):
        text = box['text'].strip()
        position_ratio = (box['x_min'] - row_x_min) / row_width if row_width > 0 else 0

        # Skip noise
        if is_noise_text(text):
            continue
        if is_phone_number(text):
            continue
        if is_serial_number(text, box_idx):
            continue

        # Try to parse as number
        val = extract_numeric_value(text)

        if val is None:
            # Non-numeric → part of item name (if on the left side)
            if position_ratio < 0.6:
                name_parts.append(text)
            continue

        # It's a number — classify it
        cleaned = clean_price_text(text).replace(',', '')

        # Reject HSN codes
        if is_hsn_code(cleaned, line_text):
            continue

        # Small integers on left/middle → quantity
        if val == int(val) and 1 <= val <= 100 and position_ratio < 0.5:
            quantity = int(val)
            continue

        # Otherwise → price candidate
        if validate_item_price(val):
            price_candidates.append((val, position_ratio))

    # Pick price intelligently:
    # If we have 2+ price candidates and a quantity, check if one is unit_price
    # and the other is line_total (unit_price * qty ≈ line_total)
    price = None
    if price_candidates:
        price_candidates.sort(key=lambda x: x[1])  # sort by position (left to right)

        if len(price_candidates) >= 2 and quantity > 1:
            # Check if leftmost_price * qty ≈ rightmost_price
            unit_candidate = price_candidates[0][0]
            total_candidate = price_candidates[-1][0]
            if abs(unit_candidate * quantity - total_candidate) / max(total_candidate, 1) < 0.05:
                # They're consistent: use the line total as price, qty=1
                # (because parsedTotal and itemSum use price * qty)
                price = total_candidate
                quantity = 1
            else:
                # Not consistent: just use the rightmost (line total)
                price = total_candidate
                quantity = 1
        else:
            # Single price candidate or qty=1: use rightmost
            price = price_candidates[-1][0]

    return name_parts, quantity, price


# ─── Main Entry Point ────────────────────────────────────────────────────

def process_bill_image(image_bytes: bytes, filename: str) -> dict:
    """
    Main OCR pipeline entry point.

    Pipeline:
    1. Decode image / convert PDF
    2. Run OCR (EasyOCR → Tesseract fallback)
    3. Cluster boxes into rows
    4. Extract items + total candidates
    5. Validate and sanitize
    6. Compute confidence

    Returns a structured dict with items, total, confidence, and validation info.
    """
    try:
        # ── Step 1: Decode image ──
        is_pdf = filename.lower().endswith('.pdf')

        if is_pdf:
            img = convert_pdf_to_images(image_bytes)
        else:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise Exception("Failed to decode image")

        logger.info(f"Image decoded: {img.shape[1]}x{img.shape[0]} pixels")

        # ── Step 2: Run OCR (preprocessing is done inside each engine wrapper) ──
        engine = "easyocr"
        boxes = extract_with_easyocr(img)

        if boxes is None:
            engine = "tesseract"
            boxes = extract_with_tesseract(img)

        if not boxes:
            logger.warning("No text detected by any OCR engine")
            return _make_error_response("No text detected in image")

        # Collect all OCR confidences for scoring
        all_ocr_confidences = [b['conf'] for b in boxes]

        # ── Step 3: Cluster into rows ──
        rows = cluster_into_rows(boxes)
        logger.info(f"Clustered {len(boxes)} boxes into {len(rows)} rows")

        # ── Step 4: Extract items and total candidates ──
        items, total_candidates = parse_line_items(rows)

        # ── Step 5: Sanitize items (remove invalid prices, dedup) ──
        clean_items = sanitize_items(items)
        logger.info(f"Extracted {len(items)} items → {len(clean_items)} after sanitization")

        # ── Step 6: Pick best total ──
        item_sum = sum(i['price'] * i.get('quantity', 1) for i in clean_items)
        parsed_total = pick_best_total(total_candidates, item_sum)

        # If no total found from keywords, use item sum
        if parsed_total <= 0:
            parsed_total = item_sum

        # ── Step 7: Validate sum vs total ──
        sum_validation = validate_sum_against_total(clean_items, parsed_total)

        # ── Step 8: Compute confidence score ──
        confidence = compute_confidence_score(
            ocr_confidences=all_ocr_confidences,
            items=clean_items,
            sum_validation=sum_validation,
        )

        # ── Step 9: Build response ──
        if not confidence['reliable'] and len(clean_items) == 0:
            return _make_error_response(
                "Low OCR confidence or invalid extraction",
                confidence=confidence,
            )

        return {
            "engine": engine,
            "items": clean_items,
            "parsedTotal": round(parsed_total, 2),
            "itemSum": round(item_sum, 2),
            "confidence": confidence,
            "validation": sum_validation,
            "totalCandidates": [round(c, 2) for c in total_candidates],
        }

    except Exception as e:
        error_msg = str(e)
        if "POPPLER_MISSING" in error_msg:
            raise e
        logger.error(f"OCR pipeline failed: {error_msg}", exc_info=True)
        raise Exception(f"OCR Error: {error_msg}")


def _make_error_response(message: str, confidence: dict | None = None) -> dict:
    """Build a structured error response."""
    return {
        "engine": "none",
        "items": [],
        "parsedTotal": 0,
        "itemSum": 0,
        "confidence": confidence or {
            "overall_confidence": 0,
            "ocr_confidence": 0,
            "extraction_confidence": 0,
            "validation_confidence": 0,
            "reliable": False,
        },
        "validation": {
            "valid": False,
            "calculated_sum": 0,
            "declared_total": 0,
            "difference_pct": 0,
            "message": message,
        },
        "totalCandidates": [],
        "error": message,
    }
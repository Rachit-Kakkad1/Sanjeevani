"""
validators.py — Post-extraction validation and sanity checks.

This is the last line of defence against garbage output.
If invalid numbers survive the noise filter AND the extractor,
the validator catches them here.
"""

import logging

logger = logging.getLogger("medclear.validators")

# ─── Configurable Limits ──────────────────────────────────────────────────

MAX_ITEM_PRICE = 10_00_000       # ₹10,00,000 — max for a single line item
MAX_TOTAL_PRICE = 50_00_000      # ₹50,00,000 — max for a bill total
MIN_ITEM_PRICE = 0.50            # ₹0.50 — minimum credible price
MAX_QUANTITY = 9999              # max credible quantity per line item
MIN_QUANTITY = 1                 # min credible quantity
SUM_TOLERANCE = 0.15             # 15% tolerance (medical bills have taxes/discounts)
MIN_CONFIDENCE_THRESHOLD = 0.25  # Below this, mark the result as unreliable


def validate_item_price(price: float) -> bool:
    """
    Returns True if the price is within a credible range for
    a single bill line item.
    """
    return MIN_ITEM_PRICE <= price <= MAX_ITEM_PRICE


def validate_total(total: float) -> bool:
    """
    Returns True if the total is within credible range for a bill.
    """
    return 0 < total <= MAX_TOTAL_PRICE


def validate_quantity(qty: int | float) -> bool:
    """
    Returns True if the quantity is within a credible range.
    """
    return MIN_QUANTITY <= qty <= MAX_QUANTITY


def validate_sum_against_total(items: list[dict], declared_total: float) -> dict:
    """
    Cross-check: does the sum of item prices ≈ the declared total?

    Returns a dict with:
    - valid: bool
    - calculated_sum: float
    - declared_total: float
    - difference_pct: float
    - message: str
    """
    if not items or declared_total <= 0:
        return {
            "valid": True,  # Can't validate, don't flag
            "calculated_sum": sum(i.get("price", 0) * i.get("quantity", 1) for i in items),
            "declared_total": declared_total,
            "difference_pct": 0,
            "message": "Insufficient data for cross-validation"
        }

    calculated_sum = sum(i["price"] * i.get("quantity", 1) for i in items)

    if calculated_sum == 0:
        return {
            "valid": True,
            "calculated_sum": 0,
            "declared_total": declared_total,
            "difference_pct": 0,
            "message": "No items to validate against"
        }

    difference = abs(calculated_sum - declared_total)
    difference_pct = difference / max(calculated_sum, declared_total)

    is_valid = difference_pct <= SUM_TOLERANCE

    if not is_valid:
        logger.warning(
            f"Sum validation failed: sum={calculated_sum:.2f}, "
            f"total={declared_total:.2f}, diff={difference_pct:.1%}"
        )

    return {
        "valid": is_valid,
        "calculated_sum": round(calculated_sum, 2),
        "declared_total": round(declared_total, 2),
        "difference_pct": round(difference_pct, 4),
        "message": "OK" if is_valid else f"Sum mismatch: items={calculated_sum:.2f} vs total={declared_total:.2f} ({difference_pct:.1%} off)"
    }


def compute_confidence_score(
    ocr_confidences: list[float],
    items: list[dict],
    sum_validation: dict,
) -> dict:
    """
    Compute an overall confidence score for the extraction result.

    Factors:
    1. OCR engine confidence (average of all box confidences)
    2. Item extraction confidence (average of item confidences)
    3. Structural confidence (did sum match total?)

    Returns:
    {
        "overall_confidence": float,  # 0.0 - 1.0
        "ocr_confidence": float,
        "extraction_confidence": float,
        "validation_confidence": float,
        "reliable": bool
    }
    """
    # OCR confidence: average of raw OCR box confidences
    ocr_conf = (
        sum(ocr_confidences) / len(ocr_confidences)
        if ocr_confidences else 0.0
    )

    # Extraction confidence: average confidence of extracted items
    item_confs = [i.get("confidence", 0) for i in items]
    extraction_conf = (
        sum(item_confs) / len(item_confs)
        if item_confs else 0.0
    )

    # Validation confidence: based on sum cross-check
    if sum_validation.get("valid", True):
        diff_pct = sum_validation.get("difference_pct", 0)
        validation_conf = max(0, 1.0 - diff_pct * 5)  # penalize divergence
    else:
        validation_conf = 0.3  # low if validation failed

    # Weighted overall
    overall = (
        ocr_conf * 0.35 +
        extraction_conf * 0.35 +
        validation_conf * 0.30
    )

    return {
        "overall_confidence": round(float(overall), 3),
        "ocr_confidence": round(float(ocr_conf), 3),
        "extraction_confidence": round(float(extraction_conf), 3),
        "validation_confidence": round(float(validation_conf), 3),
        "reliable": bool(overall >= MIN_CONFIDENCE_THRESHOLD),
    }


def sanitize_items(items: list[dict]) -> list[dict]:
    """
    Remove items that fail validation. Returns only clean items.
    Also removes duplicate items (same name + same price).
    """
    clean = []
    seen = set()

    for item in items:
        price = item.get("price", 0)
        name = item.get("rawName", "").strip()
        qty = item.get("quantity", 1)

        # Skip items with invalid prices
        if not validate_item_price(price):
            logger.info(f"Rejected item '{name}' — price {price} out of range")
            continue

        # Skip items with invalid quantities
        if not validate_quantity(qty):
            logger.info(f"Rejected item '{name}' — quantity {qty} out of range")
            item["quantity"] = 1  # Reset to safe default

        # Skip items with empty names
        if not name or len(name) < 2:
            continue

        # Dedup
        key = (name.lower(), price)
        if key in seen:
            continue
        seen.add(key)

        clean.append(item)

    return clean


def pick_best_total(candidates: list[float], item_sum: float) -> float:
    """
    Given multiple total candidates from OCR, pick the most reasonable one.

    Strategy:
    1. Filter to valid range
    2. If item_sum is available, pick the candidate closest to it
    3. Otherwise, pick the largest valid candidate
    """
    valid = [c for c in candidates if validate_total(c)]

    if not valid:
        return 0.0

    if item_sum > 0:
        # Pick candidate closest to sum of items
        return min(valid, key=lambda c: abs(c - item_sum))

    # Fallback: largest valid total
    return max(valid)

"""
noise_filter.py — Identifies and removes non-price numbers from OCR output.

The #1 cause of absurd totals (₹50,200,015,794,873) is that phone numbers,
GSTIN codes, invoice IDs, and account numbers get treated as prices.
This module catches them BEFORE the extraction stage.
"""

import re
import logging

logger = logging.getLogger("medclear.noise_filter")

# ─── Compiled Patterns (module-level for performance) ──────────────────────

# Indian GSTIN: 2 digits + 5 uppercase + 4 digits + 1 uppercase + 1 digit + Z + 1 alphanum
GSTIN_PATTERN = re.compile(
    r'\d{2}[A-Z]{5}\d{4}[A-Z]\d[Zz][A-Z\d]', re.IGNORECASE
)

# Phone numbers: 10+ consecutive digits, optionally prefixed with +91 or 0
PHONE_PATTERN = re.compile(
    r'(?:\+?\d{1,3}[\s\-]?)?\d{10,}', re.IGNORECASE
)

# Invoice / reference IDs: alphanumeric codes with mixed letters & digits, 8+ chars
INVOICE_ID_PATTERN = re.compile(
    r'[A-Z]{2,}[\-/]?\d{4,}|[A-Z\d]{8,}', re.IGNORECASE
)

# Email addresses
EMAIL_PATTERN = re.compile(
    r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'
)

# URLs
URL_PATTERN = re.compile(
    r'(?:https?://|www\.)\S+', re.IGNORECASE
)

# PIN codes (6-digit Indian postal codes, standalone)
PIN_CODE_PATTERN = re.compile(r'^\d{6}$')

# Date patterns (dd/mm/yyyy, dd-mm-yyyy, etc.)
DATE_PATTERN = re.compile(
    r'\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4}'
)

# HSN/SAC codes: 4, 6, or 8 digit codes used in Indian GST billing
HSN_PATTERN = re.compile(r'^\d{4}(?:\d{2})?(?:\d{2})?$')

# Bank account numbers: 9-18 digit pure digit strings
ACCOUNT_NUMBER_PATTERN = re.compile(r'^\d{9,18}$')

# IFSC code: 4 letters + 0 + 6 alphanumeric
IFSC_PATTERN = re.compile(r'^[A-Z]{4}0[A-Z0-9]{6}$', re.IGNORECASE)

# PAN: 5 letters + 4 digits + 1 letter
PAN_PATTERN = re.compile(r'^[A-Z]{5}\d{4}[A-Z]$', re.IGNORECASE)


# ─── Noise Keywords (case-insensitive substrings) ─────────────────────────

NOISE_KEYWORDS = [
    'gstin', 'gst no', 'gst number', 'tin no', 'pan no', 'pan:',
    'phone', 'tel', 'mobile', 'contact', 'fax',
    'invoice no', 'inv no', 'bill no', 'receipt no', 'ref no',
    'account no', 'a/c no', 'ifsc', 'bank',
    'email', 'website', 'www', 'http',
    'dl no', 'drug licence', 'licence no', 'license no',
    'cin no', 'fssai', 'reg no', 'registration',
    'patient id', 'patient no', 'uhid', 'mr no', 'mrn',
    'payment due', 'due by', 'due date',
    'address', 'city', 'state', 'pin code', 'pincode',
]

# ─── Header Row Keywords (these rows define columns, not data) ────────────

HEADER_KEYWORDS = [
    'description', 'particulars', 'item name', 'product',
    'quantity', 'qty', 'unit price', 'rate', 'amount',
    'total cost', 'sr no', 's.no', 'sl no', 'hsn',
    'batch', 'expiry', 'mfg', 'mrp',
]

# ─── Price context keywords (numbers near these ARE likely prices) ────────

PRICE_CONTEXT_KEYWORDS = [
    'total', 'amount', 'price', 'cost', 'charge', 'fee',
    'rate', 'mrp', 'subtotal', 'payable', 'net',
    'grand total', 'net amount', 'total payable',
    '₹', 'rs', 'inr', '$',
]

# ─── Quantity context keywords ────────────────────────────────────────────

QTY_CONTEXT_KEYWORDS = [
    'qty', 'quantity', 'units', 'nos', 'pcs', 'pieces',
]


def is_noise_text(text: str) -> bool:
    """
    Returns True if the text is a noise pattern that should NOT be
    used for price/item extraction.
    """
    stripped = text.strip()
    if not stripped:
        return True

    # Check structural patterns
    if GSTIN_PATTERN.search(stripped):
        return True
    if EMAIL_PATTERN.search(stripped):
        return True
    if URL_PATTERN.search(stripped):
        return True
    if DATE_PATTERN.fullmatch(stripped):
        return True
    if IFSC_PATTERN.match(stripped):
        return True
    if PAN_PATTERN.match(stripped):
        return True

    # Check if it's a standalone PIN code
    digits_only = re.sub(r'[\s\-\+]', '', stripped)
    if PIN_CODE_PATTERN.match(digits_only):
        return True

    return False


def is_phone_number(text: str) -> bool:
    """
    Returns True if the text looks like a phone number.
    A phone number is 10+ consecutive digits, optionally with
    country code prefix.
    """
    digits_only = re.sub(r'[\s\-\+\(\)]', '', text.strip())
    # Pure digit string that's 10+ digits long → phone number
    if digits_only.isdigit() and len(digits_only) >= 10:
        return True
    return False


def is_gstin(text: str) -> bool:
    """Returns True if text matches Indian GSTIN format."""
    return bool(GSTIN_PATTERN.search(text.strip()))


def is_account_number(text: str) -> bool:
    """
    Returns True if text looks like a bank account number.
    Account numbers are 9-18 digit pure digit strings.
    """
    digits_only = re.sub(r'[\s\-]', '', text.strip())
    return bool(ACCOUNT_NUMBER_PATTERN.match(digits_only))


def is_hsn_code(text: str, row_text: str = "") -> bool:
    """
    Returns True if text looks like an HSN/SAC code.
    HSN codes are 4/6/8 digit codes. We also check if
    the row contains 'hsn' or 'sac' keywords.
    """
    stripped = text.strip()
    if HSN_PATTERN.match(stripped):
        # If row context mentions HSN/SAC, definitely an HSN code
        lower_row = row_text.lower()
        if any(kw in lower_row for kw in ['hsn', 'sac', 'code']):
            return True
        # Standalone 4-digit numbers in a row with other data are likely HSN
        if len(stripped) in (4, 6, 8):
            return True
    return False


def is_noise_row(row_text: str) -> bool:
    """
    Returns True if the entire row is a noise/metadata row that should
    be skipped entirely (e.g., rows containing GSTIN, phone, address info).
    """
    lower = row_text.lower()
    for keyword in NOISE_KEYWORDS:
        if keyword in lower:
            return True
    return False


def is_header_row(row_text: str) -> bool:
    """
    Returns True if the row looks like a table header.
    Header rows define column names, not data.
    """
    lower = row_text.lower()
    header_hits = sum(1 for kw in HEADER_KEYWORDS if kw in lower)
    # If 2+ header keywords found in one row, it's a header
    return header_hits >= 2


def is_serial_number(text: str, position_in_row: int) -> bool:
    """
    Returns True if the text looks like a serial number / row index.
    Serial numbers are:
    - Small integers (1-999)
    - In the leftmost position of the row
    """
    stripped = text.strip().rstrip('.')
    if position_in_row > 0:
        return False
    try:
        val = int(stripped)
        return 1 <= val <= 999
    except ValueError:
        return False


def classify_number_context(text: str, row_text: str, position_ratio: float) -> str:
    """
    Given a number and its row context, classify what it represents.

    Args:
        text: The number text being analyzed
        row_text: The full text of the row for context
        position_ratio: Position of this box in the row (0.0 = leftmost, 1.0 = rightmost)

    Returns:
        One of: 'price', 'quantity', 'noise', 'serial', 'unknown'
    """
    stripped = text.strip()
    lower_row = row_text.lower()

    # Check if it's a noise pattern first
    if is_noise_text(stripped):
        return 'noise'
    if is_phone_number(stripped):
        return 'noise'
    if is_account_number(stripped):
        return 'noise'

    # Try to parse as number
    cleaned = clean_price_text(stripped)
    no_commas = cleaned.replace(',', '')
    try:
        val = float(no_commas) if no_commas else None
    except ValueError:
        val = None

    if val is None:
        return 'unknown'

    # Small integers at left side → likely serial number
    if val == int(val) and 1 <= val <= 999 and position_ratio < 0.2:
        return 'serial'

    # Small integers (1-100) near qty keywords → quantity
    if val == int(val) and 1 <= val <= 100:
        if any(kw in lower_row for kw in QTY_CONTEXT_KEYWORDS):
            return 'quantity'
        # If position is in the middle columns, more likely qty
        if 0.2 < position_ratio < 0.6:
            return 'quantity'

    # Numbers near price keywords → price
    if any(kw in lower_row for kw in PRICE_CONTEXT_KEYWORDS):
        if position_ratio > 0.4:  # Prices are usually on the right
            return 'price'

    # Rightmost numbers tend to be prices/totals
    if position_ratio > 0.6:
        return 'price'

    return 'unknown'


def clean_price_text(text: str) -> str:
    """
    Clean a text fragment for price extraction:
    - Remove currency symbols (₹, $, Rs, INR)
    - Handle OCR misread: '$' often read as 'S' (e.g., S150.00 → 150.00)
    - Remove leading OCR artifacts (I, l misread as 1)
    - Normalize commas in Indian number format
    """
    cleaned = text.strip()
    # Remove currency symbols and labels
    cleaned = re.sub(r'[₹$]|Rs\.?|INR', '', cleaned, flags=re.IGNORECASE).strip()
    # Handle OCR misread: 'S' before digits is likely '$'
    cleaned = re.sub(r'^S(?=\d)', '', cleaned)
    # Fix common OCR misreads: leading I or l before digits
    cleaned = re.sub(r'^[Il](?=\d)', '', cleaned)
    # Remove spaces between digit groups
    cleaned = re.sub(r'(\d)\s+(\d)', r'\1\2', cleaned)
    return cleaned


def extract_numeric_value(text: str) -> float | None:
    """
    Attempt to parse a numeric value from cleaned text.
    Supports Indian number format: 1,00,000.00
    Returns None if parsing fails or result is suspicious.
    """
    cleaned = clean_price_text(text)
    if not cleaned:
        return None

    # Remove commas for parsing
    no_commas = cleaned.replace(',', '')

    # Must be a valid decimal/integer after cleaning
    if not re.fullmatch(r'\d+\.?\d*', no_commas):
        return None

    try:
        return float(no_commas)
    except ValueError:
        return None

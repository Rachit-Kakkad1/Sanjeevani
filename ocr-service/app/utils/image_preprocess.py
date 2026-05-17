"""
image_preprocess.py — Dual-path image preprocessing for OCR.

Key insight: EasyOCR and Tesseract need DIFFERENT inputs.
- EasyOCR (deep learning): works best on grayscale with tonal information preserved.
  Binarization DESTROYS the features its CRNN model relies on.
- Tesseract (classical): works best on clean binary images with black text on white.

This module provides separate paths for each engine, plus shared utilities
for resizing, denoising, and deskewing.
"""

import cv2
import numpy as np
import logging

logger = logging.getLogger("medclear.preprocess")

# ─── Configuration ────────────────────────────────────────────────────────

MAX_WIDTH = 2000        # Scale images wider than this down
MIN_WIDTH = 600         # Scale images narrower than this up
DENOISE_STRENGTH = 10   # fastNlMeansDenoising h parameter
MAX_DESKEW_ANGLE = 15   # Ignore deskew angles beyond this
SHARPEN_KERNEL = np.array([
    [0, -0.5, 0],
    [-0.5, 3, -0.5],
    [0, -0.5, 0]
], dtype=np.float32)


def resize_image(image: np.ndarray) -> np.ndarray:
    """
    Smart resize: scale to a reasonable width for OCR accuracy vs performance.
    - Too large (phone photos 4000px): wastes memory, slow
    - Too small (<600px): OCR can't read text
    """
    h, w = image.shape[:2]

    if w > MAX_WIDTH:
        scale = MAX_WIDTH / w
    elif w < MIN_WIDTH:
        scale = MIN_WIDTH / w
    else:
        return image

    new_w = int(w * scale)
    new_h = int(h * scale)
    interpolation = cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC
    resized = cv2.resize(image, (new_w, new_h), interpolation=interpolation)
    logger.debug(f"Resized image: {w}x{h} → {new_w}x{new_h} (scale={scale:.2f})")
    return resized


def to_grayscale(image: np.ndarray) -> np.ndarray:
    """Convert to grayscale if needed."""
    if len(image.shape) == 3:
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return image


def denoise(image: np.ndarray) -> np.ndarray:
    """
    Apply non-local means denoising.
    This is the ONLY denoising step — no additional Gaussian blur,
    which would blur text edges.
    """
    return cv2.fastNlMeansDenoising(image, h=DENOISE_STRENGTH)


def sharpen(image: np.ndarray) -> np.ndarray:
    """
    Apply mild sharpening to recover text edges lost during denoising.
    Uses an unsharp-mask style kernel that enhances edges without
    amplifying noise.
    """
    return cv2.filter2D(image, -1, SHARPEN_KERNEL)


def enhance_contrast_clahe(image: np.ndarray) -> np.ndarray:
    """
    Apply CLAHE (Contrast Limited Adaptive Histogram Equalization).
    This improves readability of faded/low-contrast text.
    Must be applied to GRAYSCALE (not binary) to have any effect.
    """
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    return clahe.apply(image)


def remove_table_lines(image: np.ndarray) -> np.ndarray:
    """
    Remove horizontal and vertical table lines using morphological operations.
    This helps OCR engines focus on text rather than grid lines.
    Only applied to binary images.
    """
    # Detect horizontal lines
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
    horizontal_lines = cv2.morphologyEx(image, cv2.MORPH_OPEN, horizontal_kernel, iterations=2)

    # Detect vertical lines
    vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 40))
    vertical_lines = cv2.morphologyEx(image, cv2.MORPH_OPEN, vertical_kernel, iterations=2)

    # Combine and remove lines
    lines = cv2.add(horizontal_lines, vertical_lines)
    result = cv2.subtract(image, lines)
    return result


def deskew_image(image: np.ndarray) -> np.ndarray:
    """
    Correct slight rotation from scanning/photographing.
    Uses edge detection for more robust angle estimation.
    Only corrects angles within ±MAX_DESKEW_ANGLE degrees.
    """
    try:
        # Use Canny edges for more robust angle detection
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image

        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        coords = np.column_stack(np.where(edges > 0))

        if len(coords) < 100:
            return image

        angle = cv2.minAreaRect(coords)[-1]

        # minAreaRect returns angles in [-90, 0) range
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle

        # Skip tiny angles (not worth the interpolation artifacts)
        if abs(angle) < 0.5:
            return image

        # Skip wild angles (likely an error, not real skew)
        if abs(angle) > MAX_DESKEW_ANGLE:
            logger.warning(f"Deskew angle {angle:.1f}° exceeds limit, skipping")
            return image

        (h, w) = image.shape[:2]
        center = (w // 2, h // 2)
        matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(
            image, matrix, (w, h),
            flags=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_REPLICATE
        )
        logger.debug(f"Deskewed image by {angle:.2f}°")
        return rotated
    except Exception as e:
        logger.warning(f"Deskew failed: {e}")
        return image


def adaptive_binarize(image: np.ndarray) -> np.ndarray:
    """
    Adaptive thresholding for Tesseract.
    Produces clean black-on-white binary image.
    """
    return cv2.adaptiveThreshold(
        image, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        11, 2
    )


# ─── Main Entry Points ───────────────────────────────────────────────────

def preprocess_for_easyocr(image: np.ndarray) -> np.ndarray:
    """
    Preprocessing pipeline optimized for EasyOCR (CRNN deep learning model).

    Pipeline: resize → grayscale → denoise → sharpen → CLAHE → deskew

    IMPORTANT: NO binarization. EasyOCR needs tonal information.
    """
    img = resize_image(image)
    gray = to_grayscale(img)
    denoised = denoise(gray)
    sharpened = sharpen(denoised)
    enhanced = enhance_contrast_clahe(sharpened)
    deskewed = deskew_image(enhanced)
    return deskewed


def preprocess_for_tesseract(image: np.ndarray) -> np.ndarray:
    """
    Preprocessing pipeline optimized for Tesseract (classical OCR).

    Pipeline: resize → grayscale → denoise → CLAHE → binarize → remove lines → deskew

    Tesseract works best on clean binary images.
    """
    img = resize_image(image)
    gray = to_grayscale(img)
    denoised = denoise(gray)
    enhanced = enhance_contrast_clahe(denoised)
    binary = adaptive_binarize(enhanced)
    cleaned = remove_table_lines(binary)
    deskewed = deskew_image(cleaned)
    return deskewed
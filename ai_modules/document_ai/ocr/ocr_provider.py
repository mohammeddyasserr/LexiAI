from __future__ import annotations
import importlib
from pathlib import Path

MAX_IMAGE_SIDE = 2000

import pytesseract
pytesseract.pytesseract.tesseract_cmd = (
    r"D:\Programs\Tesseract-OCR\tesseract.exe"
)
def _preprocess_image(image):
    """Apply lightweight preprocessing before OCR.
    Steps:
    - convert to grayscale
    - resize only when the image is too large
    - apply a light denoise filter
    """
    image_filter = importlib.import_module("PIL.ImageFilter")

    grayscale_image = image.convert("L")

    width, height = grayscale_image.size
    largest_side = max(width, height)

    if largest_side > MAX_IMAGE_SIDE:
        scale = MAX_IMAGE_SIDE / float(largest_side)
        new_size = (int(width * scale), int(height * scale))
        grayscale_image = grayscale_image.resize(new_size)

    return grayscale_image.filter(image_filter.MedianFilter(size=3))


def extract_text_from_image(image_path: str | Path) -> str:
    """Extract text from an image or screenshot.
    Args:
        image_path: Path to an image or screenshot.
    Returns:
        OCR text as a string.
    TODO:
        Replace the backend if a different OCR engine is needed later.
    """
    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError(f"Image file not found: {path}")

    try:
        Image = importlib.import_module("PIL.Image")
        pytesseract = importlib.import_module("pytesseract")
    except ModuleNotFoundError as exc:
        raise RuntimeError(
            "OCR dependencies are missing. Install Pillow and pytesseract."
        ) from exc

    with Image.open(path) as image:
        processed_image = _preprocess_image(image)
        text = pytesseract.image_to_string(processed_image)

    return text.strip()

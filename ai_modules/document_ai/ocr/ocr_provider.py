from __future__ import annotations

import importlib
from pathlib import Path

MAX_IMAGE_SIDE = 2000
MIN_IMAGE_SIDE = 1500

try:
    import easyocr
except ModuleNotFoundError as exc:
    raise RuntimeError("EasyOCR is not installed. Install it to use OCR.") from exc

try:
    import numpy as np
except ModuleNotFoundError as exc:
    raise RuntimeError("NumPy is required for the EasyOCR backend.") from exc

reader = easyocr.Reader(["en"])


def _preprocess_image(image):
    image_filter = importlib.import_module("PIL.ImageFilter")

    grayscale_image = image.convert("L")

    width, height = grayscale_image.size
    largest_side = max(width, height)

    # Upscale small images
    if largest_side < MIN_IMAGE_SIDE:
        scale = MIN_IMAGE_SIDE / float(largest_side)
        new_size = (int(width * scale), int(height * scale))
        grayscale_image = grayscale_image.resize(new_size)

    # Downscale huge images
    elif largest_side > MAX_IMAGE_SIDE:
        scale = MAX_IMAGE_SIDE / float(largest_side)
        new_size = (int(width * scale), int(height * scale))
        grayscale_image = grayscale_image.resize(new_size)

    return grayscale_image.filter(image_filter.MedianFilter(size=3))


def extract_text_from_image(image_path: str | Path) -> str:
    """
    Extract text from an image using EasyOCR.
    """

    print("Using EasyOCR...")

    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError(f"Image file not found: {path}")

    try:
        Image = importlib.import_module("PIL.Image")
    except ModuleNotFoundError as exc:
        raise RuntimeError(
            "OCR dependencies are missing. Install Pillow."
        ) from exc

    with Image.open(path) as image:
        processed_image = _preprocess_image(image)

        results = reader.readtext(
            np.array(processed_image),
            detail=0,
            paragraph=True,
        )

    return "\n".join(results).strip()
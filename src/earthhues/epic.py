from pathlib import Path

import numpy as np
import requests
from PIL import Image

from .color import rgb_to_hex
from .colorspace import linear_to_srgb, srgb_to_linear

API = "https://epic.gsfc.nasa.gov/api/natural/date"
ARCHIVE = "https://epic.gsfc.nasa.gov/archive/natural"

# mid-month from a single year to keep the geometry comparable, with fallbacks for
# months where the archive has no frames on the first choice
SAMPLE_DATES = [
    [f"2020-{month:02d}-{day:02d}" for day in (15, 14, 16, 12, 18)] for month in range(1, 13)
]

DISK_MARGIN = 0.97


def list_images(date: str) -> list[str]:
    response = requests.get(f"{API}/{date}", timeout=120)
    response.raise_for_status()
    return [entry["image"] for entry in response.json()]


def download(date: str, image: str, directory) -> Path:
    """Fetch one full-disk frame, skipping frames already on disk."""
    target = Path(directory) / f"{image}.png"
    if target.exists() and target.stat().st_size > 0:
        return target
    year, month, day = date.split("-")
    url = f"{ARCHIVE}/{year}/{month}/{day}/png/{image}.png"
    response = requests.get(url, timeout=300)
    response.raise_for_status()
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(response.content)
    return target


def disk_mask(size: int) -> np.ndarray:
    """Pixels inside the illuminated disk, trimmed to avoid the limb."""
    axis = np.linspace(-1, 1, size)
    x, y = np.meshgrid(axis, axis)
    return np.hypot(x, y) < DISK_MARGIN


def frame_color(path) -> dict:
    """Mean linear reflectance of one full-disk frame."""
    image = np.array(Image.open(path).convert("RGB")).astype(np.float32)
    inside = disk_mask(image.shape[0]) & (image.sum(axis=2) > 12)
    linear = srgb_to_linear(image / 255.0)
    mean = np.array([linear[..., i][inside].mean() for i in range(3)])
    return {
        "hex": rgb_to_hex(*(linear_to_srgb(mean) * 255)),
        "reflectance": [round(float(v), 5) for v in mean],
        "mean_reflectance": round(float(mean.mean()), 5),
        "pixels": int(inside.sum()),
    }


def first_available(candidates: list[str]) -> tuple[str, str] | None:
    """First date in the list that has frames, with the frame nearest local noon."""
    for date in candidates:
        try:
            images = list_images(date)
        except requests.HTTPError:
            continue
        if images:
            return date, images[len(images) // 2]
    return None


def observed(directory, dates=None, verbose: bool = True) -> dict:
    """Disk-mean colour of Earth from DSCOVR EPIC, one frame per sampled month."""
    frames = []
    for candidates in dates or SAMPLE_DATES:
        found = first_available(candidates)
        if found is None:
            continue
        date, image = found
        if verbose:
            print(f"  epic {date}")
        frames.append({"date": date, **frame_color(download(date, image, directory))})

    reflectance = np.array([f["reflectance"] for f in frames])
    mean = reflectance.mean(axis=0)
    return {
        "frames": frames,
        "mean": {
            "hex": rgb_to_hex(*(linear_to_srgb(mean) * 255)),
            "reflectance": [round(float(v), 5) for v in mean],
            "mean_reflectance": round(float(mean.mean()), 5),
        },
    }


def implied_cloud_albedo(target: float, clear: float, fraction: float) -> float:
    """Cloud reflectance that reproduces an observed disk albedo."""
    return (target - (1 - fraction) * clear) / fraction

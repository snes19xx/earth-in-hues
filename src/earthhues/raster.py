import json
from pathlib import Path

import numpy as np
from PIL import Image

from .color import hex_to_rgb
from .masks import SURFACE_CATEGORIES, build_masks
from .sources import Sources

NO_CATEGORY = 255
PREVIEW_WIDTH = 1800

# mountain pixels are stored offset, then split back apart by the palette
MOUNTAIN_OFFSET = 128


def category_index(masks: dict) -> np.ndarray:
    """Index into SURFACE_CATEGORIES for every pixel, 255 where nothing matched."""
    shape = masks[SURFACE_CATEGORIES[0]].shape
    index = np.full(shape, NO_CATEGORY, dtype=np.uint8)
    for value, name in enumerate(SURFACE_CATEGORIES):
        index[masks[name]] = value
    return index


def encode(index: np.ndarray, mountains: np.ndarray) -> Image.Image:
    """Category index in red, mountain flag in green, once the palette is applied."""
    combined = np.where(mountains & (index < MOUNTAIN_OFFSET), index + MOUNTAIN_OFFSET, index)
    image = Image.fromarray(combined.astype(np.uint8), mode="P")

    palette = []
    for value in range(256):
        if value == NO_CATEGORY:
            palette += [NO_CATEGORY, 0, 0]
        elif value >= MOUNTAIN_OFFSET:
            palette += [value - MOUNTAIN_OFFSET, 255, 0]
        else:
            palette += [value, 0, 0]
    image.putpalette(palette)
    return image


def preview(index: np.ndarray, palette: dict) -> Image.Image:
    """Human-readable version painted with a month's colours."""
    lookup = np.zeros((256, 3), dtype=np.uint8)
    for value, name in enumerate(SURFACE_CATEGORIES):
        lookup[value] = hex_to_rgb(palette[name])
    return Image.fromarray(lookup[index], mode="RGB")


def downsample(image: Image.Image, width: int) -> Image.Image:
    """Halve the grid without blending category values."""
    height = image.height * width // image.width
    return image.resize((width, height), Image.NEAREST)


def build(sources: Sources, out_dir, palette: dict, verbose: bool = True) -> dict:
    """Write the category raster, a reduced copy, a preview and the legend."""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    masks = build_masks(sources.dem, sources.landcover)
    index = category_index(masks)
    encoded = encode(index, masks["Mountains"])

    encoded.save(out_dir / "categories.png", optimize=True)
    downsample(encoded, PREVIEW_WIDTH).save(out_dir / "categories_half.png", optimize=True)
    preview(index, palette).save(out_dir / "categories_preview.png", optimize=True)

    legend = {
        "width": index.shape[1],
        "height": index.shape[0],
        "bounds": [-180, -90, 180, 90],
        "encoding": {"red": "category index", "green": "255 where mountainous"},
        "categories": SURFACE_CATEGORIES,
        "unassigned": NO_CATEGORY,
    }
    (out_dir / "categories.json").write_text(json.dumps(legend, indent=4))

    if verbose:
        for name in ("categories.png", "categories_half.png", "categories_preview.png"):
            print(f"  {name} {(out_dir / name).stat().st_size // 1024} KB")

    return legend

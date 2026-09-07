import numpy as np
from PIL import Image

from earthhues.masks import SURFACE_CATEGORIES
from earthhues.raster import MOUNTAIN_OFFSET, NO_CATEGORY, category_index, downsample, encode, preview


def fake_masks(rows=4, cols=6):
    """One pixel block per surface category, covering the whole grid."""
    flat = np.arange(rows * cols) % len(SURFACE_CATEGORIES)
    labels = flat.reshape(rows, cols)
    return {name: labels == value for value, name in enumerate(SURFACE_CATEGORIES)}


def test_category_index_assigns_every_pixel():
    index = category_index(fake_masks())
    assert (index != NO_CATEGORY).all()
    assert set(np.unique(index)) == set(range(len(SURFACE_CATEGORIES)))


def test_category_index_marks_pixels_no_mask_claims():
    masks = fake_masks()
    masks["Oceans"] = np.zeros_like(masks["Oceans"])
    assert (category_index(masks) == NO_CATEGORY).any()


def test_encoded_red_channel_returns_the_index():
    masks = fake_masks()
    index = category_index(masks)
    mountains = np.zeros(index.shape, dtype=bool)
    rgb = np.array(encode(index, mountains).convert("RGB"))
    assert np.array_equal(rgb[..., 0], index)
    assert not rgb[..., 1].any()


def test_encoded_green_channel_returns_the_mountain_flag():
    masks = fake_masks()
    index = category_index(masks)
    mountains = np.zeros(index.shape, dtype=bool)
    mountains[0, :] = True
    rgb = np.array(encode(index, mountains).convert("RGB"))
    assert np.array_equal(rgb[..., 1] > 0, mountains)
    assert np.array_equal(rgb[..., 0], index)


def test_mountain_offset_leaves_room_for_every_category():
    assert len(SURFACE_CATEGORIES) < MOUNTAIN_OFFSET


def test_downsample_keeps_values_exact():
    masks = fake_masks(8, 12)
    index = category_index(masks)
    small = downsample(encode(index, np.zeros(index.shape, dtype=bool)), 6)
    values = np.array(small.convert("RGB"))[..., 0]
    assert small.size == (6, 4)
    assert set(np.unique(values)) <= set(np.unique(index))


def test_preview_paints_each_category_its_own_colour():
    masks = fake_masks()
    index = category_index(masks)
    palette = {name: "#010203" for name in SURFACE_CATEGORIES}
    palette["Oceans"] = "#ff0000"
    painted = np.array(preview(index, palette))
    assert tuple(painted[index == 0][0]) == (255, 0, 0)
    assert tuple(painted[index == 1][0]) == (1, 2, 3)


def test_downsample_returns_a_pillow_image():
    index = category_index(fake_masks())
    assert isinstance(downsample(encode(index, np.zeros(index.shape, bool)), 3), Image.Image)

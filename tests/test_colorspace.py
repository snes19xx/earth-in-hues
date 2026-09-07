import numpy as np
import pytest

from earthhues.color import hex_to_rgb, rgb_to_hex, weighted_mean_linear, weighted_mean_srgb
from earthhues.colorspace import (
    delta_e_2000,
    lab_to_srgb,
    linear_to_srgb,
    srgb_to_lab,
    srgb_to_linear,
)

# Sharma, Wu and Dalal (2005), table 1
CIEDE2000_PAIRS = [
    ((50.0, 2.6772, -79.7751), (50.0, 0.0, -82.7485), 2.0425),
    ((50.0, 3.1571, -77.2803), (50.0, 0.0, -82.7485), 2.8615),
    ((50.0, 2.8361, -74.0200), (50.0, 0.0, -82.7485), 3.4412),
    ((50.0, -1.3802, -84.2814), (50.0, 0.0, -82.7485), 1.0000),
    ((50.0, 0.0, 0.0), (50.0, -1.0, 2.0), 2.3669),
    ((50.0, 2.4900, -0.0010), (50.0, -2.4900, 0.0009), 7.1792),
    ((50.0, 2.5000, 0.0), (50.0, 0.0, -2.5000), 4.3065),
    ((50.0, 2.5000, 0.0), (73.0, 25.0, -18.0), 27.1492),
    ((60.2574, -34.0099, 36.2677), (60.4626, -34.1751, 39.4387), 1.2644),
    ((2.0776, 0.0795, -1.1350), (0.9033, -0.0636, -0.5514), 0.9082),
]


@pytest.mark.parametrize("lab1,lab2,expected", CIEDE2000_PAIRS)
def test_delta_e_2000_matches_sharma_reference(lab1, lab2, expected):
    assert delta_e_2000(lab1, lab2) == pytest.approx(expected, abs=1e-4)


def test_srgb_transfer_function_round_trips():
    values = np.linspace(0, 1, 257)
    assert np.allclose(linear_to_srgb(srgb_to_linear(values)), values, atol=1e-12)


def test_lab_round_trips():
    rgb = np.random.default_rng(0).random((1000, 3))
    assert np.allclose(lab_to_srgb(srgb_to_lab(rgb)), rgb, atol=1e-9)


def test_white_and_black_map_to_expected_lightness():
    assert srgb_to_lab(np.array([1.0, 1.0, 1.0]))[0] == pytest.approx(100.0, abs=1e-4)
    assert srgb_to_lab(np.array([0.0, 0.0, 0.0]))[0] == pytest.approx(0.0, abs=1e-9)


def test_hex_round_trips():
    assert rgb_to_hex(*hex_to_rgb("#3a7fbd")) == "#3a7fbd"


def test_hex_clamps_out_of_range_channels():
    assert rgb_to_hex(-20.0, 127.6, 900.0) == "#0080ff"


def test_linear_mean_is_brighter_than_encoded_mean_on_contrast():
    samples = np.array([[0.0, 0.0, 0.0], [255.0, 255.0, 255.0]])
    weights = np.array([1.0, 1.0])
    assert weighted_mean_linear(samples, weights)[0] > weighted_mean_srgb(samples, weights)[0]


def test_means_agree_on_a_uniform_category():
    samples = np.full((100, 3), 80.0)
    weights = np.ones(100)
    assert np.allclose(
        weighted_mean_linear(samples, weights), weighted_mean_srgb(samples, weights), atol=1e-9
    )

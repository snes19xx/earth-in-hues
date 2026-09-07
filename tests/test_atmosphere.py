import numpy as np
import pytest

from earthhues.atmosphere import (
    BAND_WAVELENGTHS_UM,
    cos_solar_zenith,
    optical_depth,
    rayleigh_optical_depth,
    solar_declination,
    spherical_albedo,
    top_of_atmosphere,
    transmittance,
)
from earthhues.clouds import cloud_albedo, fill_gaps
from earthhues.space import add_clouds

# commonly quoted standard-atmosphere values at the MODIS band centres
LITERATURE_TAU = [0.0520, 0.0955, 0.1876]


def bodhaine(wavelength_um):
    """Bodhaine et al. (1999), an independent parameterisation used as a cross-check."""
    w = np.asarray(wavelength_um)
    return (
        0.0021520
        * (1.0455996 - 341.29061 * w**-2 - 0.90230850 * w**2)
        / (1 + 0.0027059889 * w**-2 - 85.968563 * w**2)
    )


def test_rayleigh_depth_matches_literature_within_three_percent():
    tau = rayleigh_optical_depth(BAND_WAVELENGTHS_UM)
    assert np.allclose(tau, LITERATURE_TAU, rtol=0.03)


def test_rayleigh_depth_agrees_with_bodhaine():
    tau = rayleigh_optical_depth(BAND_WAVELENGTHS_UM)
    assert np.allclose(tau, bodhaine(BAND_WAVELENGTHS_UM), rtol=0.005)


def test_blue_scatters_more_than_red():
    tau = rayleigh_optical_depth(BAND_WAVELENGTHS_UM)
    assert tau[2] > tau[1] > tau[0]


def test_optical_depth_thins_with_altitude():
    dem = np.array([[0.0, 8500.0]])
    tau = optical_depth(dem)
    assert tau[0, 0, 1] == pytest.approx(tau[0, 0, 0] / np.e, rel=1e-5)


def test_optical_depth_ignores_bathymetry():
    tau = optical_depth(np.array([[0.0, -4000.0]]))
    assert tau[0, 0, 0] == pytest.approx(tau[0, 0, 1])


def test_declination_tracks_the_seasons():
    assert solar_declination(0) < -20
    assert solar_declination(6) > 20
    assert abs(solar_declination(2)) < 5


def test_sun_is_overhead_at_the_summer_tropic():
    assert cos_solar_zenith(np.array([23.44]), 6)[0] == pytest.approx(1.0, abs=0.01)


def test_transmittance_falls_with_slant_path():
    tau = np.array([0.1])
    assert transmittance(tau, np.array([0.5])) < transmittance(tau, np.array([1.0]))


def test_atmosphere_brightens_dark_surfaces_and_dims_bright_ones():
    tau = np.full((3, 1, 1), 0.1)
    mu = np.ones((1, 1, 1))
    dark = top_of_atmosphere(np.full((3, 1, 1), 0.01), tau, mu)
    bright = top_of_atmosphere(np.full((3, 1, 1), 0.90), tau, mu)
    assert dark[0, 0, 0] > 0.01
    assert bright[0, 0, 0] < 0.90


def test_atmosphere_adds_more_blue_than_red_over_dark_water():
    tau = rayleigh_optical_depth(BAND_WAVELENGTHS_UM)[:, None, None]
    surface = np.full((3, 1, 1), 0.01)
    toa = top_of_atmosphere(surface, tau, np.ones((1, 1, 1)))
    assert toa[2, 0, 0] > toa[0, 0, 0]


def test_spherical_albedo_stays_small_and_ordered():
    tau = rayleigh_optical_depth(BAND_WAVELENGTHS_UM)
    albedo = spherical_albedo(tau)
    assert 0 < albedo[0] < albedo[2] < 0.15


def test_cloud_albedo_rises_with_optical_thickness():
    assert cloud_albedo(4) < cloud_albedo(12) < cloud_albedo(30) < 1.0


def test_clouds_pull_the_field_toward_cloud_albedo():
    clear = np.full((3, 1, 1), 0.05)
    fully = add_clouds(clear, np.ones((1, 1)), 0.6)
    assert fully[0, 0, 0] == pytest.approx(0.6)
    assert add_clouds(clear, np.zeros((1, 1)), 0.6)[0, 0, 0] == pytest.approx(0.05)


def test_fill_gaps_replaces_missing_pixels_with_their_row_mean():
    field = np.array([[1.0, 3.0, np.nan], [np.nan, np.nan, np.nan]])
    filled = fill_gaps(field)
    assert filled[0, 2] == pytest.approx(2.0)
    assert np.isfinite(filled).all()

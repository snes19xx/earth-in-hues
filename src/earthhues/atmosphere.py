import numpy as np

# MODIS bands 1, 4 and 3, the channels Blue Marble is built from
BAND_WAVELENGTHS_UM = np.array([0.645, 0.555, 0.469])

SCALE_HEIGHT_M = 8500.0
AXIAL_TILT_DEG = 23.44
MID_MONTH_DOY = [15, 46, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349]

# below this the single-scattering geometry diverges near the terminator
MIN_COS_ZENITH = 0.05


def rayleigh_optical_depth(wavelength_um: np.ndarray) -> np.ndarray:
    """Sea-level Rayleigh optical depth, Hansen and Travis (1974)."""
    w = np.asarray(wavelength_um, dtype=np.float64)
    return 0.008569 * w**-4 * (1 + 0.0113 * w**-2 + 0.00013 * w**-4)


def optical_depth(dem: np.ndarray) -> np.ndarray:
    """Per-band optical depth thinned by terrain height, shape (3, rows, cols)."""
    sea_level = rayleigh_optical_depth(BAND_WAVELENGTHS_UM)
    thinning = np.exp(-np.maximum(dem, 0.0) / SCALE_HEIGHT_M)
    return (sea_level[:, None, None] * thinning[None, :, :]).astype(np.float32)


def solar_declination(month_index: int) -> float:
    """Declination in degrees at the middle of a calendar month."""
    doy = MID_MONTH_DOY[month_index]
    return AXIAL_TILT_DEG * np.sin(np.radians(360.0 / 365.0 * (doy - 81)))


def cos_solar_zenith(latitudes: np.ndarray, month_index: int) -> np.ndarray:
    """Cosine of the solar zenith angle at local noon for each latitude."""
    angle = np.radians(np.asarray(latitudes) - solar_declination(month_index))
    return np.clip(np.cos(angle), MIN_COS_ZENITH, 1.0)


def path_reflectance(tau: np.ndarray, mu_sun: np.ndarray, mu_view: float = 1.0) -> np.ndarray:
    """Single-scattering Rayleigh reflectance for a nadir view."""
    phase = 0.75 * (1 + mu_sun**2)
    return tau * phase / (4 * mu_sun * mu_view)


def transmittance(tau: np.ndarray, mu: np.ndarray) -> np.ndarray:
    """Direct plus forward-scattered transmittance along one path."""
    return np.exp(-tau / (2 * mu))


def spherical_albedo(tau: np.ndarray) -> np.ndarray:
    """Two-stream spherical albedo of the Rayleigh layer."""
    return tau / (tau + 2.0)


def top_of_atmosphere(surface: np.ndarray, tau: np.ndarray, mu_sun: np.ndarray) -> np.ndarray:
    """Add a Rayleigh layer above linear surface reflectance."""
    up = transmittance(tau, np.ones_like(mu_sun))
    down = transmittance(tau, mu_sun)
    coupled = surface / (1 - spherical_albedo(tau) * surface)
    return path_reflectance(tau, mu_sun) + up * down * coupled

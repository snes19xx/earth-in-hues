import numpy as np

from .atmosphere import cos_solar_zenith, optical_depth, top_of_atmosphere
from .clouds import CLOUD_OPTICAL_THICKNESS, cloud_albedo, monthly_climatology
from .color import rgb_to_hex
from .colorspace import linear_to_srgb, srgb_to_linear
from .extract import read_month
from .masks import build_masks
from .sources import MONTHS, Sources
from .weights import latitudes

VIEWS = ["surface", "atmosphere", "space"]
SENSITIVITY_THICKNESS = [6.0, 7.5, 12.0, 16.0]


def surface_reflectance(rgb: np.ndarray) -> np.ndarray:
    """Blue Marble RGB decoded to linear reflectance in 0-1."""
    return srgb_to_linear(rgb / 255.0).astype(np.float32)


def add_clouds(toa: np.ndarray, fraction: np.ndarray, albedo: float) -> np.ndarray:
    """Mix a cloud layer over the top-of-atmosphere field."""
    return fraction * albedo + (1 - fraction) * toa


def month_views(
    sources: Sources,
    month_index: int,
    cloud_fraction: np.ndarray,
    thickness: float = CLOUD_OPTICAL_THICKNESS,
):
    """The three linear-reflectance fields for one month, with its valid-pixel mask."""
    rgb, valid = read_month(sources, MONTHS[month_index])
    surface = surface_reflectance(rgb)
    tau = optical_depth(sources.dem)
    mu = cos_solar_zenith(latitudes(sources.grid), month_index)[None, :, None]

    atmosphere = top_of_atmosphere(surface, tau, mu)
    return {
        "surface": surface,
        "atmosphere": atmosphere,
        "space": add_clouds(atmosphere, cloud_fraction[None, :, :], cloud_albedo(thickness)),
    }, valid


def field_colors(field: np.ndarray, masks: dict, valid: np.ndarray, weights: np.ndarray) -> dict:
    """Area-weighted mean colour and albedo per category for one field."""
    result = {}
    for name, mask in masks.items():
        combined = mask & valid
        w = weights[combined]
        if w.sum() == 0:
            continue
        mean = np.array([np.average(field[i][combined], weights=w) for i in range(3)])
        result[name] = {
            "hex": rgb_to_hex(*(linear_to_srgb(mean) * 255)),
            "albedo": round(float(mean.mean()), 4),
        }
    return result


def build(sources: Sources, cloud_dir, cache_dir, verbose: bool = True) -> dict:
    """Per month, the surface, atmosphere and space colours of every category."""
    clouds = monthly_climatology(cloud_dir, cache_dir, verbose)
    masks = build_masks(sources.dem, sources.landcover)
    weights = sources.weights
    records = []

    for index, month in enumerate(MONTHS):
        if verbose:
            print(f"  view {month}")
        fields, valid = month_views(sources, index, clouds[index])
        records.append(
            {
                "month": month,
                "views": {name: field_colors(field, masks, valid, weights) for name, field in fields.items()},
                "cloud_fraction": round(float(np.average(clouds[index], weights=weights)), 4),
            }
        )

    return {
        "records": records,
        "cloud_albedo": round(cloud_albedo(), 4),
        "cloud_optical_thickness": CLOUD_OPTICAL_THICKNESS,
        "sensitivity": sensitivity(sources, clouds, masks, weights, verbose),
    }


def sensitivity(sources, clouds, masks, weights, verbose: bool = True) -> dict:
    """Whole-Earth space colour and albedo across a range of cloud thicknesses."""
    result = {}
    for thickness in SENSITIVITY_THICKNESS:
        if verbose:
            print(f"  sensitivity tau_c={thickness}")
        albedos, colours = [], []
        for index in range(len(MONTHS)):
            fields, valid = month_views(sources, index, clouds[index], thickness)
            entry = field_colors(fields["space"], {"Total Earth Mean": masks["Total Earth Mean"]}, valid, weights)
            albedos.append(entry["Total Earth Mean"]["albedo"])
            colours.append(entry["Total Earth Mean"]["hex"])
        result[str(thickness)] = {
            "cloud_albedo": round(cloud_albedo(thickness), 4),
            "mean_albedo": round(float(np.mean(albedos)), 4),
            "colours": colours,
        }
    return result

import numpy as np

from earthhues.gibs import COMPOSITE_DOYS, composite_dates, image_url
from earthhues.timeseries import annual_means, sensor_agreement, trend


def test_composite_days_land_on_eight_day_boundaries():
    assert all(doy % 8 == 1 for doy in COMPOSITE_DOYS)


def test_composite_dates_cover_every_year():
    dates = composite_dates("terra", 2001, 2003)
    assert len(dates) == 3 * len(COMPOSITE_DOYS)
    assert dates[0] == "2001-01-01"
    assert sorted(dates) == dates


def test_image_url_carries_date_and_layer():
    url = image_url("aqua", "2015-07-12")
    assert "TIME=2015-07-12" in url
    assert "MODIS_Aqua_L3_SurfaceReflectance_Bands143_8Day" in url


def test_trend_recovers_a_known_slope():
    years = list(range(2001, 2025))
    values = [3.0 + 0.25 * (y - 2001) for y in years]
    result = trend(years, values)
    assert result["slope_per_decade"] == 2.5
    assert result["significant"]


def test_trend_reports_noise_as_insignificant():
    years = list(range(2001, 2025))
    values = np.random.default_rng(0).normal(size=len(years))
    assert not trend(years, values)["significant"]


def test_annual_means_average_composites_within_a_year():
    records = [
        {"sensor": "terra", "year": 2001, "date": "2001-01-01", "categories": {"Deserts": {"lightness": 10.0}}},
        {"sensor": "terra", "year": 2001, "date": "2001-07-12", "categories": {"Deserts": {"lightness": 20.0}}},
    ]
    annual = annual_means(records)
    assert annual["terra"]["Deserts"][2001] == {"lightness": 15.0, "composites": 2}


def test_sensor_agreement_flags_divergence_against_the_control():
    table = {
        "terra": {"Deserts": {"slope_per_decade": 0.05}, "Oceans": {"slope_per_decade": 2.0}},
        "aqua": {"Deserts": {"slope_per_decade": 0.04}, "Oceans": {"slope_per_decade": 0.8}},
    }
    agreement = sensor_agreement(table)
    assert agreement["Oceans"]["exceeds_control"]
    assert not agreement["Deserts"]["exceeds_control"]

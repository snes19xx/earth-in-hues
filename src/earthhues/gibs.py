import datetime as dt
from pathlib import Path

import requests

WMS = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi"

LAYERS = {
    "terra": "MODIS_Terra_L3_SurfaceReflectance_Bands143_8Day",
    "aqua": "MODIS_Aqua_L3_SurfaceReflectance_Bands143_8Day",
}

FIRST_YEAR = {"terra": 2001, "aqua": 2003}
LAST_YEAR = 2024

# 8-day composites start on days 1, 9, 17 and so on
COMPOSITE_DOYS = [1, 65, 121, 193, 249, 305]


def composite_dates(sensor: str, first_year: int = None, last_year: int = LAST_YEAR):
    """Composite start dates for one sensor, six per year."""
    start = first_year or FIRST_YEAR[sensor]
    return [
        (dt.date(year, 1, 1) + dt.timedelta(days=doy - 1)).isoformat()
        for year in range(start, last_year + 1)
        for doy in COMPOSITE_DOYS
    ]


def image_url(sensor: str, date: str, width: int = 3600, height: int = 1800) -> str:
    return (
        f"{WMS}?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0"
        f"&LAYERS={LAYERS[sensor]}&CRS=EPSG:4326&BBOX=-90,-180,90,180"
        f"&WIDTH={width}&HEIGHT={height}&FORMAT=image/png&TIME={date}"
    )


def download(sensor: str, date: str, directory, timeout: int = 300) -> Path:
    """Fetch one composite, skipping dates already on disk."""
    target = Path(directory) / sensor / f"{date}.png"
    if target.exists() and target.stat().st_size > 0:
        return target

    target.parent.mkdir(parents=True, exist_ok=True)
    response = requests.get(image_url(sensor, date), timeout=timeout)
    response.raise_for_status()
    partial = target.with_suffix(".part")
    partial.write_bytes(response.content)
    partial.rename(target)
    return target


def download_all(sensors, directory, verbose: bool = True):
    """Fetch every composite for the given sensors, returning the paths kept."""
    paths = []
    for sensor in sensors:
        dates = composite_dates(sensor)
        for index, date in enumerate(dates, 1):
            try:
                paths.append((sensor, date, download(sensor, date, directory)))
            except requests.HTTPError as error:
                print(f"  {sensor} {date} unavailable: {error.response.status_code}")
                continue
            if verbose and index % 12 == 0:
                print(f"  {sensor} {index}/{len(dates)}")
    return paths

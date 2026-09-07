# Input data

Roughly 8.2 GB across three products. Download them into `DATA/` (git-ignored) with the
layout below, then run `make colors`.

```
DATA/
  jan.TIFF ... dec.TIFF        12 monthly Blue Marble composites
  gebco_2025_geotiff/*.tif     8 GEBCO elevation tiles
  MCD12C1.hdf                  MODIS land cover
```

## Blue Marble Next Generation

Monthly true-colour composites at 0.1 degree, 3600 x 1800, EPSG:4326.

- Source: https://visibleearth.nasa.gov/collection/1484/blue-marble
- Pick the 3600 x 1800 GeoTIFF for each month and rename to `jan.TIFF` through `dec.TIFF`.
- `jan.TIFF` defines the reference grid. Every other input is aligned to it.

## GEBCO 2025 elevation and bathymetry

Global terrain and seabed elevation in metres, negative below sea level.

- Source: https://www.gebco.net/data_and_products/gridded_bathymetry_data/
- Choose the GeoTIFF download for the full globe. It arrives as 8 regional tiles totalling 7 GB.
- Put the `.tif` files in `DATA/gebco_2025_geotiff/`.

## MODIS MCD12C1 land cover

IGBP classification at 0.05 degree, one label per pixel.

- Source: https://lpdaac.usgs.gov/products/mcd12c1v061/
- Requires a free NASA Earthdata login.
- Download a single yearly HDF granule and save it as `DATA/MCD12C1.hdf`.
- Reading it needs the GDAL HDF4 driver. `environment.yml` pins `libgdal-hdf4`.

## MODIS 8-day surface reflectance, multi-year

Bands 1, 4 and 3 rendered as true colour, fetched from NASA GIBS over WMS. Login not required.

- Endpoint: https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi
- Layers: `MODIS_Terra_L3_SurfaceReflectance_Bands143_8Day` (2001 onward) and the Aqua
  equivalent (2003 onward).
- `make fetch` downloads six composites per year per sensor into `DATA/gibs/{sensor}/`,
  about 2.7 GB. Dates already on disk are skipped, so an interrupted run resumes.
- Requested at 3600 x 1800 so composites land on the reference grid with no reprojection.
- Pixels that are exactly black carry no data.

Both sensors are fetched because Terra and Aqua are calibrated independently. Deserts act
as the stability control: a trend that appears on one sensor but not the other is
instrumental, not geophysical.

## MODIS cloud fraction

Daily daytime cloud fraction from GIBS, rendered against a published palette and decoded
back to values through `https://gibs.earthdata.nasa.gov/colormaps/v1.3/MODIS_Cloud_Fraction.xml`.
The palette is a 101 entry lookup, so decoding is exact.

- Layer: `MODIS_Terra_Cloud_Fraction_Day`
- `make space` fetches three days per month, each from a different year, into `DATA/clouds/`.
- Pixels the palette does not match are filled from their row mean.

## DSCOVR EPIC

Full disk true colour of the sunlit Earth from the L1 point, used to check the modelled
colour against an observation.

- API: https://epic.gsfc.nasa.gov/api/natural/date/YYYY-MM-DD
- `make epic` takes one frame near local noon per month through 2020 into `DATA/epic/`.
- These PNGs are display products with a tone curve applied. Their chromaticity is
  comparable to the model, their absolute brightness is not.

## Derived arrays

The stitched DEM and the reprojected land cover are cached as `.npy` under `cache/`.
Delete that directory to rebuild them.

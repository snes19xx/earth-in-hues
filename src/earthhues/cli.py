import argparse
import json
from pathlib import Path

from .color import METHODS
from .gibs import LAYERS, download_all
from .clouds import cloud_albedo, write_atlas
from .epic import observed
from .raster import build as raster_build
from .space import build as space_build
from .timeseries import build, rebuild, web_payload
from .extract import CANONICAL_METHOD, monthly_colors, monthly_methods, monthly_stats
from .sources import Sources


def write_json(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w") as f:
        json.dump(payload, f, indent=4)
    print(f"wrote {path}")


def cmd_colors(args) -> None:
    sources = Sources(args.data, args.cache)
    write_json(Path(args.out) / "earth_hues.json", monthly_colors(sources, args.method))


def cmd_methods(args) -> None:
    sources = Sources(args.data, args.cache)
    write_json(Path(args.out) / "earth_hues_methods.json", monthly_methods(sources))


def cmd_stats(args) -> None:
    sources = Sources(args.data, args.cache)
    write_json(Path(args.out) / "earth_hues_stats.json", monthly_stats(sources))


def cmd_fetch(args) -> None:
    kept = download_all(args.sensors, args.gibs)
    print(f"{len(kept)} composites in {args.gibs}")


def cmd_timeseries(args) -> None:
    target = Path(args.out) / "earth_hues_timeseries.json"
    if args.reuse and not target.exists():
        raise SystemExit(f"{target} is not in the repository. Drop --reuse to rebuild it.")
    derived = rebuild(target) if args.reuse else build(Sources(args.data, args.cache), args.gibs)
    write_json(target, derived)
    write_json(Path(args.out) / "earth_hues_trends.json", web_payload(derived))


def cmd_space(args) -> None:
    sources = Sources(args.data, args.cache)
    payload = space_build(sources, Path(args.data) / "clouds", args.cache)
    write_json(Path(args.out) / "earth_hues_space.json", payload)


def cmd_epic(args) -> None:
    write_json(Path(args.out) / "earth_hues_epic.json", observed(Path(args.data) / "epic"))


def cmd_cloudmap(args) -> None:
    meta = write_atlas(Path(args.data) / "clouds", args.cache, Path(args.out) / "raster" / "clouds.png")
    meta["albedo"] = round(cloud_albedo(), 4)
    write_json(Path(args.out) / "raster" / "clouds.json", meta)


def cmd_masks(args) -> None:
    sources = Sources(args.data, args.cache)
    palette = json.loads((Path(args.out) / "earth_hues.json").read_text())[0]
    raster_build(sources, Path(args.out) / "raster", palette)


def build_parser() -> argparse.ArgumentParser:
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--data", default="DATA", help="directory holding the input rasters")
    common.add_argument("--out", default="data", help="directory for generated JSON")
    common.add_argument("--cache", default="cache", help="directory for derived arrays")
    common.add_argument("--gibs", default="DATA/gibs", help="directory for GIBS composites")

    parser = argparse.ArgumentParser(prog="earthhues")
    subcommands = parser.add_subparsers(dest="command", required=True)

    colors = subcommands.add_parser("colors", parents=[common], help="monthly mean colour per category")
    colors.add_argument("--method", default=CANONICAL_METHOD, choices=METHODS)
    colors.set_defaults(func=cmd_colors)

    methods = subcommands.add_parser("methods", parents=[common], help="every estimator side by side")
    methods.set_defaults(func=cmd_methods)

    stats = subcommands.add_parser("stats", parents=[common], help="spread and area share per category")
    stats.set_defaults(func=cmd_stats)

    fetch = subcommands.add_parser("fetch", parents=[common], help="download MODIS composites")
    fetch.add_argument("--sensors", nargs="+", default=list(LAYERS), choices=list(LAYERS))
    fetch.set_defaults(func=cmd_fetch)

    timeseries = subcommands.add_parser("timeseries", parents=[common], help="multi-year trends")
    timeseries.add_argument("--reuse", action="store_true", help="recompute from stored observations")
    timeseries.set_defaults(func=cmd_timeseries)

    space = subcommands.add_parser("space", parents=[common], help="surface, atmosphere and space views")
    space.set_defaults(func=cmd_space)

    epic = subcommands.add_parser("epic", parents=[common], help="observed disk colour from DSCOVR")
    epic.set_defaults(func=cmd_epic)

    masks = subcommands.add_parser("masks", parents=[common], help="category raster for the map")
    masks.set_defaults(func=cmd_masks)

    cloudmap = subcommands.add_parser("cloudmap", parents=[common], help="seasonal cloud raster")
    cloudmap.set_defaults(func=cmd_cloudmap)

    return parser


def main(argv=None) -> None:
    parser = build_parser()
    args = parser.parse_args(argv)
    args.func(args)

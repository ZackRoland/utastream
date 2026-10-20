# UtaStream brand assets

`master/` contains the editable vector sources extracted from the approved
VectorCraft artwork in `docs/design/utastream-vinyl-bachi-refined.svg`. Treat
these SVG files as the source of truth. Files elsewhere in this directory are
production variants or generated raster exports.

## Usage

- `logo/utastream-horizontal.svg`: default full-color lockup on light surfaces.
- `logo/utastream-horizontal-dark.svg`: single-color navy lockup.
- `logo/utastream-horizontal-white.svg`: reversed lockup for dark surfaces.
- `icons/icon.svg`: normal icon with transparent corners.
- `icons/icon-maskable.svg`: full-bleed PWA icon; artwork stays in the mask-safe area.
- `favicon.svg`: simplified artwork intended for very small rendering.
- `apple-touch-icon.png`: opaque 180 px touch icon.

Do not stretch, rotate, recolor individual parts, add effects, or place the
logo on a background with insufficient contrast.

## Regenerating PNG and ICO files

Run `./scripts/export-brand-assets.sh` from the repository root on macOS.
The script rasterizes the SVG separately at every requested final dimension.
It does not downscale an intermediate PNG, so small assets retain the detail
and edge quality of the vector source.

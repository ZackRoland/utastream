#!/bin/sh
set -eu

repo_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
brand_dir="$repo_dir/public/brand"
tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT INT TERM
mkdir -p "$brand_dir/icons" "$brand_dir/social"

# Quick Look rasterizes each SVG directly at its final dimensions. The output
# is copied as-is; no intermediate bitmap or resize pass is involved.
render_svg() { 
  source_svg=$1
  output_png=$2
  pixel_size=$3
  preview_dir="$tmp_dir/$(basename "$output_png" .png)"
  mkdir -p "$preview_dir"
  qlmanage -t -s "$pixel_size" -o "$preview_dir" "$source_svg" >/dev/null 2>&1
  cp "$preview_dir/$(basename "$source_svg").png" "$output_png"
}

for size in 64 128 192 256 512 1024; do
  render_svg "$brand_dir/icons/icon.svg" "$brand_dir/icons/icon-$size.png" "$size"
done

render_svg "$brand_dir/icons/icon-maskable.svg" "$brand_dir/icons/icon-maskable-512.png" 512
render_svg "$brand_dir/icons/icon-maskable.svg" "$brand_dir/apple-touch-icon.png" 180
render_svg "$brand_dir/favicon.svg" "$brand_dir/favicon-16.png" 16
render_svg "$brand_dir/favicon.svg" "$brand_dir/favicon-32.png" 32
render_svg "$brand_dir/favicon.svg" "$brand_dir/favicon-48.png" 48
render_svg "$brand_dir/icons/icon.svg" "$brand_dir/social/utastream-profile-1024.png" 1024

if sips -s format ico "$brand_dir/favicon-48.png" --out "$brand_dir/favicon.ico" >/dev/null 2>&1; then
  :
else
  echo "Warning: this macOS version could not create favicon.ico." >&2
fi

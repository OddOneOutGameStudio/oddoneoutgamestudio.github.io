#!/usr/bin/env bash
# Records the home-page loop of the architecture map: one headless-Chrome frame per trace step,
# stitched by ffmpeg. Needs the local preview server (python3 -m http.server 8140) and Google Chrome.
#   tools/arch-record.sh build        → assets/video/szczury-arch-loop.mp4 + assets/img/szczury-arch.jpg
set -euo pipefail
TRACE="${1:-build}"; BASE="${BASE:-http://localhost:8140}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="$(mktemp -d)"; cd "$(dirname "$0")/.."
STEPS=$(node -e "const s=require('fs').readFileSync('assets/js/szczury-arch.js','utf8');const d=JSON.parse(s.slice(s.indexOf('const ARCH = ')+13, s.indexOf(';\n\n(function')));console.log(d.traces.find(t=>t.id==='$TRACE').steps.length)")
for ((i=0;i<STEPS;i++)); do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=1280,720 --force-device-scale-factor=1 \
    --virtual-time-budget=4000 --screenshot="$OUT/f$(printf %03d $i).png" "$BASE/tools/arch-capture.html?trace=$TRACE&step=$i" >/dev/null 2>&1
done
ffmpeg -v error -y -framerate 1/1.1 -i "$OUT/f%03d.png" -vf "scale=1280:720,format=yuv420p" -r 10 -c:v libx264 -preset slow -crf 24 -movflags +faststart -an assets/video/szczury-arch-loop.mp4
cp "$OUT/f$(printf %03d $((STEPS/2))).png" "$OUT/poster.png"
ffmpeg -v error -y -i "$OUT/poster.png" -q:v 4 assets/img/szczury-arch.jpg
echo "frames: $STEPS → assets/video/szczury-arch-loop.mp4"; rm -rf "$OUT"

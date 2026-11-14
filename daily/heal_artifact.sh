#!/usr/bin/env bash
# Rescue a finished Short from a past daily-shorts run: download its artifacts, heal it, write out/<date>/<slug>/.
# usage: bash daily/heal_artifact.sh <run_id> <slug>
# env:  GH_TOKEN/GITHUB_TOKEN (repo token), HEAL_WORK (scratch dir), HEAL_RERENDER=1 (needs Blender),
#       HEAL_FETCH_PLATES=1 (also download p-<slug>-* parts)
# Runs heal.py with the SAME shortqa hard gate; never loosens thresholds or posts anything.
set -euo pipefail
RUN_ID=${1:?usage: heal_artifact.sh <run_id> <slug>}
SLUG=${2:?usage: heal_artifact.sh <run_id> <slug>}
ROOT=$(cd "$(dirname "$0")/.." && pwd)
REPO=${GITHUB_REPOSITORY:?GITHUB_REPOSITORY not set}
export GH_TOKEN=${GH_TOKEN:-${GITHUB_TOKEN:-}}
W=${HEAL_WORK:-${RUNNER_TEMP:-/tmp}/heal-$RUN_ID-$SLUG}
rm -rf "$W"; mkdir -p "$W"/{short,case,plan,parts,daily/work/$SLUG,rm/public/real3d}

echo "heal_artifact: run=$RUN_ID slug=$SLUG work=$W"
gh run download "$RUN_ID" -R "$REPO" -n "short-$SLUG" -D "$W/short"
gh run download "$RUN_ID" -R "$REPO" -n "case-$SLUG" -D "$W/case"
if ! gh run download "$RUN_ID" -R "$REPO" -n plan -D "$W/plan"; then
  echo "heal_artifact: WARNING no plan artifact; trying short packaging only" >&2
fi

FINAL=$(find "$W/short" -name final.mp4 -print -quit)
[ -n "$FINAL" ] || { echo "heal_artifact: no final.mp4 in short-$SLUG" >&2; exit 1; }
SHORT_DIR=$(dirname "$FINAL"); DATE=$(basename "$(dirname "$SHORT_DIR")")
CASE_DIR=$(find "$W/case" -name cues.json -print -quit); CASE_DIR=$(dirname "${CASE_DIR:-}")
[ -n "$CASE_DIR" ] && [ -f "$CASE_DIR/cues.json" ] || { echo "heal_artifact: no cues.json in case-$SLUG" >&2; exit 1; }
case "$CASE_DIR" in "$W"/case/*) : ;; *) mkdir -p "$W/case/$SLUG"; cp -r "$CASE_DIR"/* "$W/case/$SLUG"/; CASE_DIR="$W/case/$SLUG" ;; esac

cp "$FINAL" "$W/final.mp4"
[ -d "$W/plan/$SLUG" ] && cp -r "$W/plan/$SLUG"/* "$W/daily/work/$SLUG"/
for f in yt_title.txt yt_desc.txt x_text.txt x_thread.json VERIFY.md; do
  [ -f "$SHORT_DIR/$f" ] && cp -f "$SHORT_DIR/$f" "$W/daily/work/$SLUG/$f"
done
if [ ! -f "$W/daily/work/$SLUG/plan.json" ]; then
  echo "heal_artifact: no plan.json (plan artifact expired?) - cannot heal without shot/scene map" >&2; exit 1
fi

QA=$(find "$W/short" -name qa.json -print -quit)
python3 - "$W" "$SLUG" "$QA" <<'PY'
import json, os, sys
w, slug, qa = sys.argv[1:4]
q = json.load(open(qa)) if qa and os.path.exists(qa) else {}
json.dump({'rendered': {}, 'replaced': q.get('plates_replaced', {}), 'missing': q.get('plates_missing', [])},
          open(os.path.join(w, 'rm', 'public', 'real3d', slug + '.plates.json'), 'w'), indent=1)
PY

if [ "${HEAL_FETCH_PLATES:-0}" = "1" ]; then
  echo "heal_artifact: downloading p-$SLUG-* parts (optional)"
  gh run download "$RUN_ID" -R "$REPO" -p "p-$SLUG-*" -D "$W/parts_raw" || true
  find "$W/parts_raw" -name 'part_*.mp4' -exec cp -f {} "$W/parts/" \;
  python3 "$ROOT/daily/assemble_plates.py" "$SLUG" "$W/parts" "$CASE_DIR/cues.json" "$W/rm/public/real3d/$SLUG" || true
fi

CUTS=$(python3 -c "import json,sys;print(','.join(str(c) for c in json.load(open(sys.argv[1]))['cuts'][1:]))" "$CASE_DIR/cues.json")
mkdir -p "$W/sqa"
python3 "$ROOT/daily/scary-reels/pipeline/shortqa.py" "$W/final.mp4" "$W/sqa" --cuts "$CUTS" --jev || true
BEFORE=$(python3 -c "import json;d=json.load(open('$W/sqa/report.json'));print(json.dumps({k:d.get(k) for k in ('pass','lufs','true_peak_dbfs','dark_ranges','frozen_ranges')}))" 2>/dev/null || echo '{}')
echo "heal_artifact: before $BEFORE"

ARGS=("$SLUG" "$W" "$W/sqa" --cuts "$CUTS" --max-rounds 3)
[ "${HEAL_RERENDER:-0}" = "1" ] && ARGS+=(--rerender)
python3 "$ROOT/daily/heal.py" "${ARGS[@]}" || true

PASS=0
if [ -f "$W/sqa/heal.json" ]; then
  PASS=$(python3 -c "import json;print(1 if json.load(open('$W/sqa/heal.json')).get('pass') else 0)")
fi
RC=1
if [ "$PASS" = "1" ]; then
  # refresh the official sqa/ report from the healed final.mp4 (same gate, same cuts)
  python3 "$ROOT/daily/scary-reels/pipeline/shortqa.py" "$W/final.mp4" "$W/sqa" --cuts "$CUTS" --jev && RC=0 || RC=1
fi
POSTFLAG=(); [ "$RC" = "0" ] && POSTFLAG=(--post)
OUT="$ROOT/out/$DATE/$SLUG"
rm -rf "$OUT"
python3 "$ROOT/daily/finalize.py" "$W/daily/work/$SLUG" "$W/final.mp4" "$W/sqa" "$RC" \
  "$W/rm/public/real3d/$SLUG.plates.json" "$OUT" "${POSTFLAG[@]}"
[ -f "$W/sqa/heal.json" ] && cp -f "$W/sqa/heal.json" "$OUT/heal.json"
echo "heal_artifact: wrote $OUT"
if [ -f "$OUT/qa.json" ]; then
  python3 -c "import json;d=json.load(open('$OUT/qa.json'));print('heal_artifact: pass=%s post=%s healed=%s'%(d.get('pass'),d.get('post'),d.get('healed')))"
fi
[ "$RC" = "0" ]

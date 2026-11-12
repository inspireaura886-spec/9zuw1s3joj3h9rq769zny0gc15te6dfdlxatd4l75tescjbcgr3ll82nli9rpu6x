#!/bin/bash
# Write step of daily-shorts. Env: PROMPT, DATE, FIRST_MODEL, OPENCODE_API_KEY (never printed).
# 0) briefs/<date>.md from Hark (env BRIEF) wins; else 1) Jev (TypeSafe jev-latest) picks topics from fresh candidates (advisory)  2) OpenCode coding agent writes + validates the plans
# 3) Jev reviews each script (hook score, one noul per line vs the fact pack, pacing, payoff -> go/no-go); a no-go gets one fix round
# 4) Jev picks narrator assignment, title, frame-0 text, palette and sound bed (daily/apply_jev.py). No TYPESAFE_API_KEY (secret JEV) = steps skipped.
set -u
mkdir -p daily/work
HINT=""
if [ -n "${BRIEF:-}" ]; then HINT="

=== TODAY'S BRIEF FROM HARK (director) ===
$BRIEF
=== END BRIEF ==="; PICKS=""; else
python3 daily/candidates.py > /tmp/cands.json
python3 tools/jev.py choose /tmp/cands.json 2 > daily/work/.choice.json; cat daily/work/.choice.json
PICKS=$(python3 -c "import json;d=json.load(open('daily/work/.choice.json'));print(', '.join(d.get('picks',[])))" 2>/dev/null); fi
[ -n "$PICKS" ] && HINT="
Decision layer (Jev) picked these topics from the fresh candidates, best first: $PICKS. Use them unless dedupe or verification fails; then pick another fresh topic yourself."
AVAIL=$(timeout 120 opencode models opencode 2>/dev/null || true)
echo "free models visible:"; echo "$AVAIL" | grep -i free | head -20
MODELS=""
for m in "${FIRST_MODEL:-opencode/glm-5.3-flash-free}" opencode/glm-5.3-flash-free opencode/minimax-m3.1-flash-free opencode/deepseek-v4.1-flash-free opencode/big-pickle; do
  case " $MODELS " in *" $m "*) continue;; esac
  if [ -z "$AVAIL" ] || echo "$AVAIL" | grep -qx "$m"; then MODELS="$MODELS $m"; fi
done
[ -z "$MODELS" ] && MODELS=$(echo "$AVAIL" | grep -i free | head -2 | tr '\n' ' ')
echo "model order: $MODELS"
ERR=""; REVIEWED=0
for M in $MODELS; do
  for ROUND in 1 2; do
    if [ -z "$ERR" ]; then P="$PROMPT$HINT"; else
      P="$PROMPT

The files already in daily/work/ need fixing. Fix every point below (edit the files, or replace a topic that is a repeat), then run the validator again until both pass:
$ERR"; fi
    echo "=== $M round $ROUND ==="
    timeout 1800 opencode run --model "$M" "$P" 2>&1 | tail -n 150
    DIRS=$(ls -d daily/work/*/ 2>/dev/null | head -2)
    if [ -n "$DIRS" ]; then ERR=$(python3 daily/validate.py $DIRS 2>&1); RC=$?; else ERR="No folders in daily/work/. Write two Short folders."; RC=1; fi
    echo "$ERR"
    N=$(ls -d daily/work/*/ 2>/dev/null | wc -l)
    if [ $RC = 0 ] && [ "$N" = 2 ]; then
      ERR=""; NOGO=0
      for d in $DIRS; do python3 tools/jev.py review $d > $d/review.json; echo "review $d: $(cat $d/review.json)"
        if python3 -c "import json,sys;r=json.load(open('$d/review.json'));sys.exit(0 if r.get('ok') and r.get('go') is False else 1)"; then
          NOGO=1; ERR="$ERR
Critic (Jev) says NO-GO for $d: $(cat $d/review.json). Rewrite that script's hook/lines to fix it (keep all PLAYBOOK rules)."; fi; done
      if [ $NOGO = 0 ] || [ $REVIEWED = 1 ]; then echo "PLANS OK with $M"; echo "$M" > daily/work/.model; python3 daily/apply_jev.py $DIRS || true; python3 daily/validate.py $DIRS; exit 0; fi
      REVIEWED=1; continue
    fi
    [ "$N" -gt 2 ] && ERR="$ERR
There are $N folders in daily/work/; keep exactly 2 (delete the extra ones)."
  done
done
# keep whatever single plans pass on their own
OK=0; for d in daily/work/*/; do if python3 daily/validate.py "$d" >/dev/null 2>&1; then OK=$((OK+1)); else echo "dropping invalid plan $d"; rm -rf "$d"; fi; done
[ $OK -gt 0 ] && { echo "continuing with $OK valid plan(s)"; exit 0; }
echo "no valid plans"; exit 1

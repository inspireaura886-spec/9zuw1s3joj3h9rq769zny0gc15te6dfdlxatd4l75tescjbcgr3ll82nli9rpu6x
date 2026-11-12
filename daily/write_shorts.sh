#!/bin/bash
# Run OpenCode (free models, no API key) until daily/work/ holds 2 valid Short plans. Env: PROMPT, DATE, FIRST_MODEL.
set -u
mkdir -p daily/work
AVAIL=$(timeout 120 opencode models opencode 2>/dev/null || true)
echo "free models visible:"; echo "$AVAIL" | grep -i free | head -20
MODELS=""
for m in "${FIRST_MODEL:-opencode/deepseek-v4.1-flash-free}" opencode/deepseek-v4.1-flash-free opencode/glm-5.3-flash-free opencode/big-pickle; do
  case " $MODELS " in *" $m "*) continue;; esac
  if [ -z "$AVAIL" ] || echo "$AVAIL" | grep -qx "$m"; then MODELS="$MODELS $m"; fi
done
[ -z "$MODELS" ] && MODELS=$(echo "$AVAIL" | grep -i free | head -2 | tr '\n' ' ')
echo "model order: $MODELS"
ERR=""
for M in $MODELS; do
  for ROUND in 1 2; do
    if [ -z "$ERR" ]; then P="$PROMPT"; else
      P="$PROMPT

The validator rejected the current files in daily/work/. Fix every error below (edit the files, or replace a topic that is a repeat), then run the validator again until both pass:
$ERR"; fi
    echo "=== $M round $ROUND ==="
    timeout 1800 opencode run --model "$M" "$P" 2>&1 | tail -n 150
    DIRS=$(ls -d daily/work/*/ 2>/dev/null | head -2)
    if [ -n "$DIRS" ]; then ERR=$(python3 daily/validate.py $DIRS 2>&1); RC=$?; else ERR="No folders in daily/work/. Write two Short folders."; RC=1; fi
    echo "$ERR"
    N=$(ls -d daily/work/*/ 2>/dev/null | wc -l)
    if [ $RC = 0 ] && [ "$N" = 2 ]; then echo "PLANS OK with $M"; echo "$M" > daily/work/.model; exit 0; fi
    [ "$N" -gt 2 ] && ERR="$ERR
There are $N folders in daily/work/; keep exactly 2 (delete the extra ones)."
  done
done
# keep whatever single plans pass on their own
OK=0; for d in daily/work/*/; do if python3 daily/validate.py "$d" >/dev/null 2>&1; then OK=$((OK+1)); else echo "dropping invalid plan $d"; rm -rf "$d"; fi; done
[ $OK -gt 0 ] && { echo "continuing with $OK valid plan(s)"; exit 0; }
echo "no valid plans"; exit 1

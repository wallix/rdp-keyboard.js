#!/usr/bin/env bash

# uncompress: tar --zstd -xf kbdlayout.info.zst

set -e

d="$(dirname "$0")"

genfile() {
  "$d"/gen_reversed_keylayout.py "$@" > "$d"/../lib/reversed_layouts.js
}

if [[ -z "$KBDLAYOUT_PATH" ]]; then
   KBDLAYOUT_PATH="$d"/kbdlayout.info
fi

case "$1" in
  --all|all)
    genfile "${KBDLAYOUT_PATH}"/* ;;

  --regular|'')
    source "$d"/keylayout_list.sh
    genfile "${KBDLAYOUT_LAYOUTS[@]}" ;;

  --help|help)
    echo "usage:
$0 [--all|all|--regular|regular]
$0 files..." ;;

  *) genfile "$@"
esac

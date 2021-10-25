#!/usr/bin/env sh
set -e
cd "$(dirname "$0")"
case "$1" in
  *help|-h) echo "$0 [--coverage|coverage]" ;;
  *coverage) NODE_PATH=$PWD/lib ./node_modules/.bin/tap --coverage --coverage-map=map.js --coverage-report=html ;;
  *) NODE_PATH=$PWD/lib ./node_modules/.bin/tap --no-coverage ;;
esac

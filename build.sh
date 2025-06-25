#!/usr/bin/env bash
# shellcheck disable=SC2015
# Copyright (c) 2025 Jeffrey H. Johnson
# SPDX-License-Identifier: MIT

################################################################################
# Strict

set -eu

################################################################################
# Error trap

error_report () {
  printf '\n%s\n' "⚠ ERROR at line ${1:?}!"
  exit 1
}

trap 'error_report ${LINENO:-0}' ERR INT

################################################################################
# ShellCheck

command -v shellcheck > /dev/null 2>&1 || {
  printf '%s\n' "⚠ shellcheck missing!" 2> /dev/null || true
} || true

command -v shellcheck > /dev/null 2>&1 && {
  printf '%s\n' "• ShellCheck …" 2> /dev/null || true
  shellcheck -o any,all build.sh
} || true

################################################################################
# Build HTML

# index.html
printf '%s\n' "• Build index.html …" 2> /dev/null || true
TITLE="Illuminationes"
cat top.template index.template bottom.template > index.html
latindate > index.template.date
LATINDATE="$(cat index.template.date)"
sed -i index.html -e "s/###LATINDATE###/${LATINDATE:?}/"
sed -i index.html -e "s/###TITLE###/${TITLE:?}/"

# test.html
printf '%s\n' "• Build test.html …" 2> /dev/null || true
TITLE="Test Page"
cat top.template stars.template test.template bottom.template > test.html
LATINDATE="$(cat test.template.date)"
sed -i test.html -e "s/###LATINDATE###/${LATINDATE:?}/"
sed -i test.html -e "s/###TITLE###/${TITLE:?}/"

################################################################################
# Prettier

command -v npx > /dev/null 2>&1 || {
  printf '%s\n' "⚠ npx missing!" 2> /dev/null || true
} || true

command -v npx > /dev/null 2>&1 && {
  printf '%s\n' "• Prettier …" 2> /dev/null || true
  npx prettier           \
    --bracket-same-line  \
    --log-level error    \
    --no-bracket-spacing \
    --print-width 100    \
    --tab-width 4        \
    --write \
	housestyle.js \
	test.html \
	index.html
} || true

################################################################################
# Grep

grep -n 'etc\.' ./*.html && {
  printf '%s\n' "⚠ 'etc.' should be '<small>%c</small>.'"
} || true

################################################################################
# Done

printf '%s\n' "✓ Success!" || true

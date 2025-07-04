#!/usr/bin/env bash
# shellcheck disable=SC2015
# Copyright (c) 2025 Jeffrey H. Johnson
# SPDX-License-Identifier: MIT

################################################################################
# Start
printf '\n%s\n' "• Starting build$(env TZ=UTC date +' - %c' || true)"

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

BASEURL="https://johnsonjh.github.io/"

################################################################################
# Prettier (templates)

command -v npx > /dev/null 2>&1 || {
  printf '%s\n' "⚠ npx missing!" 2> /dev/null || true
} || true

# shellcheck disable=SC2046
command -v npx > /dev/null 2>&1 && {
  printf '%s\n' "• Prettier (templates) …" 2> /dev/null || true
  npx prettier           \
    --bracket-same-line  \
    --log-level error    \
    --no-bracket-spacing \
    --print-width 100    \
    --tab-width 4        \
    --write              \
    --parser html        \
	$(find . -name '*.template' ! -name 'closer.template')
} || true
sed -i top.template  \
    -e 's#</body>##' \
    -e 's#</html>##' \
    -e 's/^    $//'

###########################################################
# index.html

printf '%s\n' "• Build index.html …" 2> /dev/null || true
TITLE="Illuminationes"
cat                 \
    top.template    \
    index.template  \
    bottom.template \
  > index.html
latindate > index.template.date
LATINDATE="$(cat index.template.date)"
sed -i index.html                          \
    -e "s/###LATINDATE###/${LATINDATE:?}/" \
    -e "s/###TITLE###/${TITLE:?}/"         \
    -e "s%###BASEURL###%${BASEURL:?}%g"

###########################################################
# test.html

printf '%s\n' "• Build test.html …" 2> /dev/null || true
TITLE="Test Page"
cat                    \
    top.template       \
    stars.template     \
    test.template      \
    signature.template \
    bottom.template    \
    closer.template    \
 > test.html
LATINDATE="$(cat test.template.date)"
sed -i test.html                           \
    -e "s/###LATINDATE###/${LATINDATE:?}/" \
    -e "s/###TITLE###/${TITLE:?}/"         \
    -e "s%###BASEURL###%${BASEURL:?}%g"

###########################################################
# blog_1.html

printf '%s\n' "• Build blog_1.html …" 2> /dev/null || true
TITLE="Test Page"
cat                    \
    top.template       \
    stars.template     \
    blog_1.template    \
    signature.template \
    bottom.template    \
    closer.template    \
 > blog_1.html
LATINDATE="$(cat blog_1.template.date)"
sed -i blog_1.html                         \
    -e "s/###LATINDATE###/${LATINDATE:?}/" \
    -e "s/###TITLE###/${TITLE:?}/"         \
    -e "s%###BASEURL###%${BASEURL:?}%g"

################################################################################
# Prettier (finalize)

command -v npx > /dev/null 2>&1 && {
  printf '%s\n' "• Prettier (finalize) …" 2> /dev/null || true
  npx prettier           \
    --bracket-same-line  \
    --log-level error    \
    --no-bracket-spacing \
    --print-width 100    \
    --tab-width 4        \
    --write              \
	housestyle.js    \
	blog_1.html      \
	test.html        \
	index.html
} || true

################################################################################
# Grep

grep -n 'etc\.' ./*.html && {
  printf '%s\n' "⚠ 'etc.' should be '<small>%c</small>.'"
} || true

################################################################################
# Finish

printf '%s\n' "✓ Success$(env TZ=UTC date +' - %c' || true)"

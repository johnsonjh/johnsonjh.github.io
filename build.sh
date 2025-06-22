#!/usr/bin/env sh
# shellcheck disable=SC2015
# Copyright (c) 2025 Jeffrey H. Johnson
# SPDX-License-Identifier: MIT

########################################################################
# ShellCheck

command -v shellcheck > /dev/null 2>&1 || {
  printf '%s\n' "⚠ shellcheck missing!" 2> /dev/null || true
} || true

command -v shellcheck > /dev/null 2>&1 && {
  printf '%s\n' "• ShellCheck …" 2> /dev/null || true
  shellcheck -o any,all build.sh
} || true

########################################################################
# REUSE

# command -v reuse > /dev/null 2>&1 || {
#   printf '%s\n' "⚠ reuse missing!" 2> /dev/null || true
# } || true

# command -v reuse > /dev/null 2>&1 && {
#   printf '%s\n' "• REUSE …" 2> /dev/null || true
#   reuse lint -q || reuse lint
# } || true

########################################################################
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
    --print-width 132    \
    --tab-width 4        \
    --write \
	housestyle.js \
	index.html \
	manuscript.css \
	manuscript.js \
	manuscript.top.js \
	versify.css \
	versify.js
} || true

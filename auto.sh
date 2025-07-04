#!/usr/bin/env sh
# Copyright (c) 2025 Jeffrey H. Johnson
# SPDX-License-Identifier: MIT

while :; do
  inotifywait -e close_write ./*
  ./build.sh
done

#!/bin/bash
# file: _build_all.sh

set -eE
for f in build_*.sh
do
  rm -f _work/*
  echo "Building $f"
  ./$f
done
rm -f _work/*

#!/usr/bin/env bash
set -e
./run.py -o _work --compile # compile first so that build output does not appear in txt files

./run.py -o _work --no-color | tee run.txt

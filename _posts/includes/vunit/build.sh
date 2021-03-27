#!/bin/env bash
# file: build.sh
set -e

./run.py -o _work --compile # compile first so that build output does not appear in txt files

./run.py -o _work --no-color | tee run.txt

./run_vunit.py -o _work --compile # compile first so that build output does not appear in txt files

./run_vunit.py -o _work --no-color | tee run_vunit.txt

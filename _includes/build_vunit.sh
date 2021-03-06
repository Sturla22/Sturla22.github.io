#!/bin/bash
# file: build_vunit.sh

./run_vunit.py -o _work --no-color | tee half_adder_vunit_tb.txt

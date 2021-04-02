#!/bin/bash
# file: build_cocotb.sh
set -Ee

make SIM=ghdl | tee half_adder_cocotb_tb.txt

#!/bin/bash
# file: build_tb.sh

set -eE
options=""
test_bench="half_adder_tb"
ghdl="ghdl"
workdir="_work"
vcd="yes"

source tb_build.sh

#!/bin/bash
# file: build_pltbutils.sh

set -eE
options=""
test_bench="half_adder_pltb_tb"
ghdl="ghdl"
workdir="_work"
lib_src=~/Dev/hdl/pltbutils/trunk/src/vhdl/*.vhd
lib_name="work"

source lib_build.sh

source tb_build.sh

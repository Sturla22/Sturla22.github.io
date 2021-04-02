#!/bin/bash
# file: build_osvvm.sh

set -eE
options="--std=08"
test_bench="half_adder_osvvm_tb"
ghdl="ghdl"
workdir="_work"
lib_src=~/Dev/hdl/OSVVM/*.vhd
lib_name=osvvm

source lib_build.sh

source tb_build.sh

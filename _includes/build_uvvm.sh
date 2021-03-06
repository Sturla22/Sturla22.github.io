#!/bin/bash
# file: build_uvvm.sh

set -eEx
options="--std=08 -frelaxed"
test_bench="half_adder_uvvm_tb"
ghdl="/usr/local/bin/ghdl"
workdir="_work"
lib_src=~/Dev/hdl/UVVM/uvvm_util/src/*.vhd
lib_name=uvvm_util

source lib_build.sh

source tb_build.sh

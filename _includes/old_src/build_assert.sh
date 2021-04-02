#!/bin/bash
# file: build_assert.sh

set -eE
options="--std=08 -frelaxed"
test_bench="half_adder_assert_tb"
ghdl="ghdl"
workdir="_work"

source tb_build.sh

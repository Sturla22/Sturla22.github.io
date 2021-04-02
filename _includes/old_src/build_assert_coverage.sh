#!/bin/bash
# file: build_assert_coverage.sh

set -eEx
options="-frelaxed"
test_bench="half_adder_assert_tb"
ghdl="ghdl-gcc"
workdir="_work"

source cov_build.sh

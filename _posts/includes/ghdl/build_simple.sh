#!/bin/env bash
# file: build_simple.sh

if [[ $# -lt 1 || $# -gt 1 ]]; then
  echo "Usage: build.sh design_name"
  exit 1
fi

design=$*
testbench=${design}_tb

set -ex

ghdl -i $design.vhd $testbench.vhd
ghdl -m $testbench
ghdl -r $testbench

#!/bin/env bash
# file: build.sh

if [[ $# -lt 1 || $# -gt 1 ]]; then
  echo "Usage: build.sh design_name"
  exit 1
fi

design=$*
testbench=${design}_pltb_tb
workdir=_work
options="-P$workdir --workdir=$workdir"

set -ex

ghdl -i $options $design.vhd $testbench.vhd
ghdl -m $options $testbench
ghdl -r $options $testbench

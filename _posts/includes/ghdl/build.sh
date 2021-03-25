#!/bin/env bash
# file: build.sh

if [[ $# -lt 1 || $# -gt 1 ]]; then
  echo "Usage: build.sh design_name"
  exit 1
fi

design=$*
testbench=${design}_tb
workdir=_work
options="-P$workdir --workdir=$workdir"

# Make sure workdir exists
mkdir -p $workdir

set -ex

ghdl -i $options $design.vhd $testbench.vhd
ghdl -m $options $testbench
ghdl -r $options $testbench

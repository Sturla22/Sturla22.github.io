#!/bin/env bash
set -ex

./buildlib.sh pltbutils ~/Dev/hdl/pltbutils/trunk/src/vhdl/*.vhd
./build.sh half_adder_pltb

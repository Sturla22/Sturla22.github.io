#!/bin/bash
# file: build_uvvm_clean.sh
/usr/local/bin/ghdl -i --std=08 -frelaxed --workdir=_work -P_work --work=uvvm_util ~/Dev/hdl/UVVM/uvvm_util/src/*.vhd

/usr/local/bin/ghdl -i --std=08 -frelaxed --workdir=_work -P_work --work=uvvm_util --workdir=_work -P_work half_adder.vhd half_adder_uvvm_tb.vhd
/usr/local/bin/ghdl -m --std=08 -frelaxed --workdir=_work -P_work --work=uvvm_util --workdir=_work -P_work half_adder_uvvm_tb

/usr/local/bin/ghdl -r --std=08 -frelaxed --workdir=_work -P_work --work=uvvm_util --workdir=_work -P_work half_adder_uvvm_tb

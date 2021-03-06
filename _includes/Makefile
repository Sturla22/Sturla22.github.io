# File: Makefile

SIM_BUILD=_work
COCOTB_RESULTS_FILE=_work/results.xml
VHDL_SOURCES=$(PWD)/half_adder.vhd
# TOPLEVEL is the name of the toplevel module in your Verilog or VHDL file:
TOPLEVEL=half_adder
# MODULE is the name of the Python test file:
MODULE=half_adder_cocotb_tb

include $(shell cocotb-config --makefiles)/Makefile.sim

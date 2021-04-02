"""
File: half_adder_cocotb_tb.py
"""

import cocotb


@cocotb.test()
async def half_adder_cocotb_tb(dut):
    # Check defaults on output ports
    if dut.o_SUM != 0:
        raise cocotb.result.TestError("sum should be zero with no input")
    if dut.o_CARRY != 0:
        raise cocotb.result.TestError("carry should be zero with no input")

    # Check logic
    dut.i_BIT1 <= 0
    dut.i_BIT2 <= 0
    await cocotb.triggers.Timer(10, units="ns")
    if dut.o_SUM != 0:
        raise cocotb.result.TestError(
            f"sum should be '0' with inputs {dut.i_BIT1} and {dut.i_BIT2}"
        )
    if dut.o_CARRY != 0:
        raise cocotb.result.TestError(
            f"carry should be '0' with inputs {dut.i_BIT1} and {dut.i_BIT2}"
        )

    dut.i_BIT1 <= 0
    dut.i_BIT2 <= 1
    await cocotb.triggers.Timer(10, units="ns")
    if dut.o_SUM != 1:
        raise cocotb.result.TestError(
            f"sum should be '1' with inputs {dut.i_BIT1} and {dut.i_BIT2}"
        )
    if dut.o_CARRY != 0:
        raise cocotb.result.TestError(
            f"carry should be '0' with inputs {dut.i_BIT1} and {dut.i_BIT2}"
        )

    dut.i_BIT1 <= 1
    dut.i_BIT2 <= 0
    await cocotb.triggers.Timer(10, units="ns")
    if dut.o_SUM != 1:
        raise cocotb.result.TestError(
            f"sum should be '1' with inputs {dut.i_BIT1} and {dut.i_BIT2}"
        )
    if dut.o_CARRY != 0:
        raise cocotb.result.TestError(
            f"carry should be '0' with inputs {dut.i_BIT1} and {dut.i_BIT2}"
        )

    dut.i_BIT1 <= 1
    dut.i_BIT2 <= 1
    await cocotb.triggers.Timer(10, units="ns")
    if dut.o_SUM != 0:
        raise cocotb.result.TestError(
            f"sum should be '0' with inputs {dut.i_BIT1} and {dut.i_BIT2}"
        )
    if dut.o_CARRY != 1:
        raise cocotb.result.TestError(
            f"carry should be '1' with inputs {dut.i_BIT1} and {dut.i_BIT2}"
        )

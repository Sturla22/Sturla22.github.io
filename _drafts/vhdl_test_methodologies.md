---
layout: post
title: "VHDL Test Methodologies"
tags:
    - VHDL
    - HDL
    - FPGA
    - simulation
    - PlTbUtils
    - UVVM
    - OSVVM
    - VUnit
    - cocotb
---

I'll be exploring several VHDL test methodologies in the coming posts. This post is an overview in preparation for the upcoming posts.

{% include toc.html %}

These methodologies are:

- PlTbUtils
- UVVM
- OSVVM
- VUnit
- cocotb

My goal is to create an unbiased comparison and evaluation of the overlapping of the available methodologies.

## Design Example

The comparison will be made for testing a simple entity, a half adder posted on [https://www.nandland.com/vhdl/modules/module-half-adder.html](https://www.nandland.com/vhdl/modules/module-half-adder.html)

[Wikipedia](https://en.wikipedia.org/wiki/Adder_(electronics)#Half_adder) section on half adders.

A more advanced entity might be interesting to compare in the future.

```vhdl
{% include half_adder.vhd %}
```

## Classic Testbench

The test bench provided by nandland looks like this:

```vhdl
{% include half_adder_tb.vhd %}
```

Note that I had to add the last wait to make the simulation stop when running in GHDL.

You can play around with the code at: [https://www.edaplayground.com/x/RiYQ](https://www.edaplayground.com/x/RiYQ)

Saving this code in the files `half_adder.vhd` and `half_adder_tb.vhd`, we can compile and simulate with [GHDL](vhdl-ghdl.html):

```bash
{% include build_tb.sh %}
```

where `tb_build.sh` is a build script with parameters for GHDL:

```bash
{% include tb_build.sh %}
```

The resulting waveform is saved in the vcd file `half_adder_tb.vcd` and can be viewed with [gtkwave](gtkwave.html):

```bash
gtkwave half_adder_tb.vcd
```

The result is:

![wave form](/assets/img/half_adder_tb_wave.png)

This approach to writing testbenches requires that the waveform of the simulation is inspected and compared to what was expected. This hinders automation and good practices such as continuous integration.

## Improved Testbench

So in order to solve the issue of having to inspect waveforms to deterrmine the correctness of a design, we can turn to VHDL's `assert` statement.

See [the post with the improved testbench](improved-testbench.html).

This approach is a lot more verbose than the classic testbench but it also provides programmable verification, this is crucial for larger designs.
The downsides to this testbench are

1. Verbosity
2. Custom solution -> need to teach new hires about it every time, need to maintain it internally etc.
3. This is probably something everyone needs, good candidate for a library

So in hopes of mitigating these points we turn to the available methodologies and libraries.

## PlTbUtils

[PlTbUtils](https://opencores.org/projects/pltbutils) is described as "a collection of functions, procedures and testbench components that simplifies creation of stimuli and checking results of a device under test."

See [the post on PlTbUtils](pltbutils_basic.html).

PlTbUtils is a pure VHDL library with convenience components.

## UVVM

[UVVM](https://uvvm.org/), which stands for Universal VHDL Verification Methodology is "a free and Open Source Methodology and Library for making very structured VHDL-based testbenches."

See [the post on UVVM](uvvm.html).

UVVM is a pure VHDL library with convenience components and .
**TODO(sl)**: describe UVVM succinctly.

## OSVVM

[OSVVM](https://osvvm.org/) "provides a methodology and library to simplify the entire verification effort." Among other features, it supports transaction level modeling,  functional coverage, randomized test generation, data structures, and basic utilities.

See [the post on OSVVM](osvvm.html).

OSVVM is a pure VHDL library with convenience components and .
**TODO(sl)**: describe OSVVM succinctly.

## VUnit

[VUnit](https://vunit.github.io/index.html) "features the functionality needed to realize continuous and automated testing" of HDL code.

See [the post on VUnit](vunit.html).

VUnit takes care of building, running tests (via a simulator like GHDL) and evaluating the results. It also offers VHDL convenience components and Verification Components (VCs).

## cocotb

[cocotb](https://docs.cocotb.org/en/stable/) "encourages the same philosophy of design re-use and randomized testing as [UVM](https://en.wikipedia.org/wiki/Universal_Verification_Methodology), however is implemented in Python."

See [the post on cocotb](cocotb.html).

## First Impressions



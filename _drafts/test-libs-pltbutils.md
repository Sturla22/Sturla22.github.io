---
title: PlTbUtils
layout: post
tags:
    - PlTbUtils
    - VHDL
    - HDL
    - FPGA
    - simulation
---

[PlTbUtils](https://opencores.org/projects/pltbutils) is described as "a collection of functions, procedures and testbench components that simplifies creation of stimuli and checking results of a device under test."

See [VHDL Test Methodologies](vhdl_test_methodologies.html#design-example) for context.

## PlTbUtils Testbench

Adjusting the testbench from [VHDL Test Methodologies](vhdl_test_methodologies.html#classic-testbench) for PlTbUtils results in

```vhdl
{% include half_adder_pltb_tb.vhd %}
```

The following script compiles the library in to the work lib, compiles the design and testbench, and finally runs the test bench:

```bash
{% include build_pltbutils.sh %}
```

The output from running the testbench is:

```
{% include half_adder_pltb_tb.txt %}
```

No modifications to the environment or libraries were needed to run PlTbUtils.


[Back to VHDL Test Methodologies](vhdl_test_methodologies.html#pltbutils)

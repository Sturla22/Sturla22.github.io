---
layout: post
title: OSVVM
tags:
    - VHDL
    - HDL
    - FPGA
    - simulation
    - OSVVM
---

Implementing a testbench for the [half adder](vhdl_test_methodologies.html#design-example) with OSVVM would look like this


```vhdl
{% include half_adder_osvvm_tb.vhd %}
```
Play with the code at [https://www.edaplayground.com/x/cu47](https://www.edaplayground.com/x/cu47)

The build script is as follows

```bash
{% include build_osvvm.sh %}
```

A build script for OSVVM is also provided by GHDL: [https://github.com/ghdl/ghdl/blob/master/scripts/vendors/compile-osvvm.sh](https://github.com/ghdl/ghdl/blob/master/scripts/vendors/compile-osvvm.sh)

The output is

```
{% include half_adder_osvvm_tb.txt %}
```

No modifications were needed to [GHDL](ghdl.html) but some files were removed from the OSVVM repository to make the build script as simple as possible. The removed files (`../OSVVM/VendorCovApiPkg_Aldec.vhd` and `../OSVVM/MemoryPkg_2019.vhd`) contained duplicates and unsupported language features which GHDL complained about.

[Back to VHDL Test Methodologies](vhdl_test_methodologies.html#osvvm)

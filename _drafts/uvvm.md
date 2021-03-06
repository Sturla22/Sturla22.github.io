---
layout: post
title: UVVM
tags:
    - VHDL
    - HDL
    - FPGA
    - simulation
    - UVVM
---

[UVVM](https://uvvm.org/), which stands for Universal VHDL Verification Methodology is "a free and Open Source Methodology and Library for making very structured VHDL-based testbenches."

According to its authors, the framework was released to enable and increase "Overview, Readability, Maintainability, Extensibility and Reuse".

Implementing a testbench for the [half adder](vhdl_test_methodologies.html#design-example) with UVVM would look like this

```vhdl
{% include half_adder_uvvm_tb.vhd %}
```
Play with the code at [https://www.edaplayground.com/x/cLyB](https://www.edaplayground.com/x/cLyB)

To build with [GHDL](ghdl.html) I had to build [GHDL v1.0](https://github.com/ghdl/ghdl/releases/tag/v1.0.0) [from sources](https://ghdl.readthedocs.io/en/latest/getting/mcode.html#build-mcode) since 0.37 packaged by PopOS! seems to be missing `ieee.numeric_std` with `—std=08`, which is required for the context clause. I also ran into problems with the order of arguments: `-frelaxed` [must be placed after the](https://ghdl.readthedocs.io/en/latest/quick_start/README.html?highlight=shared#quick-start-guide) `—std=08` argument.

Building the UVVM util lib can be done like this:

```bash
{% include build_uvvm_clean.sh %}
```

This results in error:

```
../UVVM/uvvm_util/src/string_methods_pkg.vhd:1280:36:error: constant interface "val" was not annotated with attribute "element"
../UVVM/uvvm_util/src/string_methods_pkg.vhd:1320:36:error: constant interface "val" was not annotated with attribute "element"
../UVVM/uvvm_util/src/string_methods_pkg.vhd:1360:36:error: constant interface "val" was not annotated with attribute "element"
```

Which seems to be a [missing VHDL-2008 feature in the GHDL implementation](https://github.com/ghdl/ghdl/issues/1593), the indicated lines are doing something along the lines of:

```vhdl
val'element'length*val'length  -- Maximum length of the array elements
```

the type of val is:

```vhdl
type t_slv_array      is array (natural range <>) of std_logic_vector;
```

Changing the `val'element'length` to constant 1 in the affected lines, as shown below, allowed me to finally run the test bench, this may affect the results though.
```vhdl
1*val'length  -- Maximum length of the array elements
```

To decrease the output verbosity I changed the following lines in `uvvm_util/src/adaptations_pkg.vhd`
```vhdl
  constant C_SHOW_UVVM_UTILITY_LIBRARY_INFO         : boolean := false;  -- Set this to false when you no longer need the initial info
  constant C_SHOW_UVVM_UTILITY_LIBRARY_RELEASE_INFO : boolean := false;  -- Set this to false when you no longer need the release info
```

The output (also stored by UVVM in `_Log.txt`) is

```
{% include half_adder_uvvm_tb.txt %}
```

It should be noted that a build script for UVVM is available as a part of GHDL: [https://github.com/ghdl/ghdl/blob/master/scripts/vendors/compile-uvvm.sh](https://github.com/ghdl/ghdl/blob/master/scripts/vendors/compile-uvvm.sh)

[Back to VHDL Test Methodologies](vhdl_test_methodologies.html#uvvm)

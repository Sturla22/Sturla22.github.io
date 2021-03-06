---
layout: post
title: Improved Testbench
---

In order to solve the issue of having to inspect waveforms to determine the correctness of a design, we can turn to VHDL's `assert` statement.

See [VHDL Test Methodologies](vhdl_test_methodologies.html#design-example) for context.

```vhdl
{% include half_adder_assert_tb.vhd %}
```
You can play around with the code at: [https://www.edaplayground.com/x/Ayfa](https://www.edaplayground.com/x/Ayfa)

Compile and simulate with:

```bash
{% include build_assert.sh %}
```
Note that the `std.env.stop` procedure requires the `--std=08` flag and the unprotected shared variable `assert_cnt` requires the `-frelaxed` flag.

The result is:
```
{% include half_adder_assert_tb.txt %}
```

This approach is a lot more verbose but it also provides programmable verification, this is crucial for larger designs.
The downsides to the above test bench are

1. Verbosity
2. Custom solution -> need to teach new hires about it every time, need to maintain it internally etc.
3. This is probably something everyone needs, good candidate for a library

So in hopes of mitigating these points we turn to the available methodologies and libraries.

[Back to VHDL Test Methodologies](vhdl_test_methodologies.html#improved-testbench)

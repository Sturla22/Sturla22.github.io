---
layout: post
title: GHDL Code Coverage
tags:
    - VHDL
    - Tools
    - HDL
    - FPGA
    - simulation
    - coverage
---

Code coverage can be an indication of untested code. Let's explore code coverage in [GHDL](vhdl-ghdl.html).

I tried following the guide at [https://devsaurus.github.io/ghdl\_gcov/ghdl\_gcov.html](https://devsaurus.github.io/ghdl_gcov/ghdl_gcov.html) but ran into some issues, which is to be expected, the post is at least 5 years old.

We need `ghdl-gcc` for gcov support according to the [GHDL docs](https://ghdl.readthedocs.io/en/latest/getting/index.html?highlight=gcov).

```bash
{% include build_assert_coverage.sh %}
```

According to [this SO answer](https://stackoverflow.com/a/38854385) the flags should be `-fprofile-arcs`, `-ftest-coverage` for analysis and then `-Wl,-lgcov`, `-Wl,--coverage` for elaboration.

```bash
{% include cov_build.sh %}
```
[gcovr](https://gcovr.com/en/stable/) parses the `.gcno` and `.gcda` files and displays them in a human readable form. To avoid compatibility problems between the generated files and gcov, we instruct gcovr to use gcov-9 since my GHDL executable uses GNAT 9.3.0.

But no dice, cover column is 0% and there are no `.gcda` files to be seen.

```
{% include half_adder_assert_tb_coverage.txt %}
```

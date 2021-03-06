---
layout: post
title: cocotb
---

Apparently [GHDL support is preliminary](https://docs.cocotb.org/en/stable/simulator_support.html#ghdl).

[Installing](https://docs.cocotb.org/en/stable/install.html) can be done with `pip install cocotb`


Implementing a testbench for the [half adder](vhdl_test_methodologies.html#design-example) with cocotb would look like this

```python
{% include half_adder_cocotb_tb.py %}
```

cocotb requires a Makefile that points out files, the toplevel entity and includes the cocotb makefiles

```make
{% include Makefile %}
```

and running with
```bash
{% include build_cocotb.sh %}
```

results in

```
{% include half_adder_cocotb_tb.txt %}
```

[Back to VHDL Test Methodologies](vhdl_test_methodologies.html#osvvm)

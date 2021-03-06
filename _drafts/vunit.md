---
layout: post
title: VUnit
---

[Installing](https://vunit.github.io/installing.html) can be done with `pip instal vunit_hdl`

Implementing a testbench for the [half adder](vhdl_test_methodologies.html#design-example) with VUnit would look like this

```vhdl
{% include half_adder_vunit_tb.vhd %}
```

VUnit requires that we write a python script to run the tests:
```python
{% include run_vunit.py %}
```

running the python script with

```bash
{% include build_vunit.sh %}
```

results in

```
{% include half_adder_vunit_tb.txt %}
```

[Back to VHDL Test Methodologies](vhdl_test_methodologies.html#osvvm)

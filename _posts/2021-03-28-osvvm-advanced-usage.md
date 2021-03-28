---
layout: post
title: "OSVVM - Advanced Usage"
tags:
    - VHDL
    - "VHDL Libraries"
    - OSVVM
published: false
---

Chapter 5 of [OSVVM's Test Writer's User Guide](https://github.com/OSVVM/Documentation/blob/master/OSVVM_test_writers_user_guide.pdf) explains how their testbench framework consists of a test sequencer, TestCtrl, and a top level testbench which they call a test harness. However, no examples are given on how to create this setup. I resorted to digging around in OSVVM's own testbenches to find out how to do that. This post will cover how to create your own setup of the testbench framework.

{% include toc.html %}

This setup is entirely overkill for simple designs, but perhaps appropriate for board- or system-level testbenches.

## Template

I based this template on the tests in [OSVVM's UART verification component](https://github.com/OSVVM/UART/blob/ec0e17f6622145173754d6b56f78d86cf92cd249/testbench/TbUart_Checkers1.vhd). To use the template clone [this repository](https://github.com/sturla22/osvvm_advanced_template), change 'example' to something descriptive and fill in for comments that start with 'Template: '. You can see an example [at the end of this post](#example).

### Test Controller

We'll start with the test control entity which provides a configuration point later on for hooking in you test cases.

```vhdl
{% include_relative includes/osvvm-advanced-usage/osvvm-advanced-usage-template/example/test_controller.vhd %}
```

### Test Harness

The test harness serves the purpose of connecting the design under test to the test controller. This leads to a reusable setup which is useful for large designs with complicated setups, like board-level simulations.

```vhdl
{% include_relative includes/osvvm-advanced-usage/osvvm-advanced-usage-template/example/test_harness.vhd %}
```

### Test Case

In the test case you finally implement your test code. As you can see in the listing below I have numbered the file, this is an indication that we can create multiple test cases and reuse the harness and controller.

```vhdl
{% include_relative includes/osvvm-advanced-usage/osvvm-advanced-usage-template/example/test_case_1.vhd %}
```

## Example

Let's have a go at filling in the template for a half adder design from [nandland](https://www.nandland.com/vhdl/modules/module-half-adder.html) which I used in [previous]({% post_url 2021-03-15-vhdl-style-guide %}) [posts]({% post_url 2021-03-25-ghdl %}). To reiterate my point from above, this is a complete overkill for such a simple design.

```vhdl
{% include_relative includes/osvvm-advanced-usage/half_adder/half_adder.vhd %}
```

The in-filled template follows, I've kept the template comments to highlight what changes I made when instantiating the template.

### Test Controller

I've basically copied the port definition from the design, but set the port mode to inout on all ports.

```vhdl
{% include_relative includes/osvvm-advanced-usage/half_adder/test_controller.vhd %}
```

### Test Harness

For the test harness you copy the `test_controller` entity port definitions into the `test_controller` component, define the signals needed for the ports and finally connect the ports of the `test_controller` to your design.

```vhdl
{% include_relative includes/osvvm-advanced-usage/half_adder/test_harness.vhd %}
```

### Test Cases

The test case file is where the manual labor stops and you need to start thinking about how to test your design.

```vhdl
{% include_relative includes/osvvm-advanced-usage/half_adder/test_case_1.vhd %}
```

### Running

Since VUnit detects that the `test_controller` has a `runner_cfg` generic we need to decorate the testbench with an attribute and then run the python script below with

`./run.py --with-attributes .run`

```python
{% include_relative includes/osvvm-advanced-usage/run.py %}
```

The output is

```
{% include_relative includes/osvvm-advanced-usage/run.txt %}
```

## Conclusion



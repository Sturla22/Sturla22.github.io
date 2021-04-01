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

{% assign figure_num = 1 %}
{% assign listing_num = 1 %}

{% include toc.html %}

This setup is entirely overkill for simple designs, but perhaps appropriate for board- or system-level testbenches, and that is what I mean by advanced, i.e. going beyond the Affirm/Check/Asserts of self checking testbenches and into testbenches that can get up to tens of thousands of lines and are checking the integration of several components for example.

The architecture of test benches tends towards something like the following image:

{%
  include image.html
  dir="/assets/img/"
  file="Classic_Testbench.png"
  figure_num=figure_num
  description="Classic testbench"
%}
{% assign figure_num = figure_num | plus: 1 %}

Here I've used 'Unit' to describe the combination of an Entity and Architecture, there are probably more correct terms out there (module?).

With OSVVM's approach of using a Test Controller to separate the test harness and the test cases we get a clear interface to the design under test (DUT).

{%
  include image.html
  dir="/assets/img/"
  file="Test_Controller.png"
  figure_num=figure_num
  description="Test Controller"
%}
{% assign figure_num = figure_num | plus: 1 %}


## Template

I based this template on the tests in [OSVVM's UART verification component](https://github.com/OSVVM/UART/blob/ec0e17f6622145173754d6b56f78d86cf92cd249/testbench/TbUart_Checkers1.vhd). To use the template, clone [this repository](https://github.com/sturla22/osvvm_advanced_template) and follow the instructions in the readme. You can see a usage example [at the end of this post](#example).

### Test Controller

We'll start with the test control entity which provides a configuration point later on for hooking in you test cases.

<!-- {% increment listing_num %} -->
{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="Template for test controller"
  dir="includes/osvvm-advanced-usage/osvvm-advanced-usage-template/example/"
  file="test_controller.vhd"
%}

### Test Harness

The test harness serves the purpose of connecting the design under test to the test controller. This leads to a reusable setup which is useful for large designs with complicated setups, like board-level simulations.

<!-- {% increment listing_num %} -->
{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="Template for test harness"
  dir="includes/osvvm-advanced-usage/osvvm-advanced-usage-template/example/"
  file="test_harness.vhd"
%}

### Test Case

In the test case you finally implement your test code. As you can see in the listing below I have numbered the file, this is an indication that we can create multiple test cases and reuse the harness and controller.

<!-- {% increment listing_num %} -->
{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="Template for a test case"
  dir="includes/osvvm-advanced-usage/osvvm-advanced-usage-template/example/"
  file="test_case_1.vhd"
%}

## Example

Let's have a go at filling in the template for a half adder design from [nandland](https://www.nandland.com/vhdl/modules/module-half-adder.html) which I used [in]({% post_url 2021-03-27-vunit %}) [previous]({% post_url 2021-03-15-vhdl-style-guide %}) [posts]({% post_url 2021-03-25-ghdl %}). To reiterate my point from above, this is a complete overkill for such a simple design.

<!-- {% increment listing_num %} -->
{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="Example design"
  dir="includes/osvvm-advanced-usage/half_adder/"
  file="half_adder.vhd"
%}

The filled-in template follows, I've kept most of the template comments to highlight what changes I made when instantiating the template.

### Test Controller

I've basically copied the port definition from the design, but set the port mode to inout on all ports.

<!-- {% increment listing_num %} -->
{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="Example test controller"
  dir="includes/osvvm-advanced-usage/half_adder/"
  file="test_controller.vhd"
%}

### Test Harness

For the test harness you copy the `test_controller` entity port definitions into the `test_controller` component, define the signals needed for the ports and finally connect the ports of the `test_controller` to your design.

<!-- {% increment listing_num %} -->
{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="Example test harness"
  dir="includes/osvvm-advanced-usage/half_adder/"
  file="test_harness.vhd"
%}

### Test Cases

The test case file is where the manual labor stops and you need to start thinking about how to test your design. I've really only added the stimulation and checks in the `check_process` here.

<!-- {% increment listing_num %} -->
{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="Example test case"
  dir="includes/osvvm-advanced-usage/half_adder/"
  file="test_case_1.vhd"
%}

### Running

Since VUnit detects that the `test_controller` has a `runner_cfg` generic we need to decorate the testbench with an attribute and then run the python script below with `./run.py --with-attributes .run`

<!-- {% increment listing_num %} -->
{%
  include python_code_snippet.html
  listing_num=listing_num
  description="Example VUnit run script"
  dir="includes/osvvm-advanced-usage/"
  file="run.py"
%}

The output is:

<!-- {% increment listing_num %} -->
{%
  include code_snippet.html
  listing_num=listing_num
  description="Output from running VUnit"
  dir="includes/osvvm-advanced-usage/"
  file="run.txt"
%}

OSVVM's output is on lines 9 and 10 above, showing that there was an alert at 4 ns and that there was one error.

## Conclusion

Maybe the title is a bit of a misnomer... this approach is not entirely dependent on OSVVM, it is more of a design pattern. But the fact remains that OSVVM pushes this design pattern and their synchronization methods make the implementation a lot easier than implementing these yourself. The design pattern itself is a clever way to get around either copy-pasting a lot of setup code for different tests of the same integration, or keeping the setup and all of the test cases in a single, _enormous_, file.


---
layout: post
title: "VHDL Testbench Library Comparison"
tags:
    - VHDL
    - "VHDL Libraries"
last_modified_at: 2021-04-10
---

This post is an overview of testbench utility libraries, verification components will be covered in a separate post. The intention is to help with selecting which library to use, since I haven't found a neutral comparison of them anywhere.

{% include toc.html %}

{% assign listing_num = 1 %}

The libraries I'll be exploring in this post are:

- OSVVM
- PlTbUtils
- UVVM
- VUnit

I'll be deferring the discussion of cocotb to another post, since it is not implemented in VHDL.

## High-Level Comparison

Let's take a look at some of the most common features offered by the libraries.

|                       | OSVVM                | PlTbUtils      | UVVM                           | VUnit                         |
|----------------------:|:--------------------:|:--------------:|:------------------------------:|:-----------------------------:|
| **Assert**            | Affirm               | check          | check_\*                       | check[\_\*]                   |
| **Wait**              | WaitFor(Clock,Level) | wait(sig,clks) | await_\*                       |                               |
| **Logging**           | Log                  | print[,v,2]    | log                            | log                           |
| **Signal Generators** | Create(Clock,Reset)  | clkgen         | [adjustable\_]clock\_generator |                               |
| **Watchdog**          | WaitForBarrier       | waitsig        | watchdog                       | set\_timeout                  |
| **Testbench Control** |                      | Yes            |                                | Yes                           |
| **Text Utils**        | Yes                  | Yes            | Yes                            |                               |
| **Random**            | Yes                  |                | Yes                            |                               |
| **License**           | Apache 2.0           | LGPL           | Apache 2.0                     | Mozilla Public License, v.2.0 |

{%
  include table.html
  description="Library comparison"
  table_num=1
%}

Here I've grouped together similar functionality and tried to indicate how to access it in the libraries that implement it, even though the features within each functionality may be vastly different between libraries. This gives a birds-eye view of the common functionality. Empty cells indicate that the functionality is not implemented.

 - **Assert** are procedures that act like assert statements, checking a condition.
 - **Wait** functionality is an extension of wait statements.
 - **Logging** comes in many flavors in these libraries, the procedures mentioned in the table can all print to the transcript. Some offer much more functionality.
 - **Testbench control** indicates that the libraries provide procedures that are meant to be used when initializing a testbench or individual tests.
 - **Text utils** indicates that the library provides some form of functions to handle text, common features are replacing substrings, changing case and adding/removing whitespace.
 - **Signal generators** are primarily used to generate clock signals for simulations.
 - The **watchdog** functionality stops the simulation in case of an abnormally long-running test.
 - OSVVM and UVVM offer **random** number generation.
 - Finally the open-source **licenses** used by the libraries are mentioned.

This list of features is by no means complete with regards to the features of each library. The following sections will describe some more details, but for a full understanding, readers are referred to the documentation of each library.

## OSVVM Utility Library

[OSVVM](https://osvvm.org/), or Open Source VHDL Verification Methodology, "provides a methodology and library to simplify the entire verification effort." Among other features, it supports transaction level modeling, functional coverage, randomized test generation, data structures, and basic utilities. The packages that I have deemed to belong to the utility category (rather than the verification components category) are:

- AlertLog
- Coverage
- Random
- TbUtil (Wait, Signal Generators)
- TextUtil
- Transcript (File IO for logging)

Since the Wait functionality offers timeout, a watchdog functionality is easily implemented.

These are documented in OSVVM's documentation repository: <https://github.com/OSVVM/Documentation>

{% capture details %}
{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="Half Adder Testbench Using OSVVM"
  dir="includes/vhdl-testbench-library-comparison/"
  file="half_adder_osvvm_tb.vhd"
%}
{% assign listing_num = listing_num | plus: 1 %}
{% endcapture %}
{% include details.html details=details summary="Example testbench code" %}

### Simulator Support

OSVVM's documentation states which simulators are supported in their documentation: `Aldec` (`Active-HDL`/`RivieraPRO`), `Mentor` (`Questa`/`ModelSim`) and `GHDL`. `GHDL` officially supports OSVVM and runs [scheduled testsi](https://github.com/ghdl/extended-tests) to check that it works.


## PlTbUtils

[PlTbUtils](https://opencores.org/projects/pltbutils) is described as "a collection of functions, procedures and testbench components that simplifies creation of stimuli and checking results of a device under test." PlTbUtils consists of three packages:

- Components (Generate signals)
- Functions (Assert, Wait, Text Utilities, Testbench Control, Logging,
- Text Util

Since the Wait functionality offers timeout, a watchdog functionality is easily implemented.

I have created Doxygen documentation for PlTbUtils, which is hosted here: <https://sturla22.github.io/pltbutils>

{% capture details %}
{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="Half Adder Testbench Using PlTbUtils"
  dir="includes/vhdl-testbench-library-comparison/"
  file="half_adder_pltb_tb.vhd"
%}
{% assign listing_num = listing_num | plus: 1 %}
{% endcapture %}
{% include details.html details=details summary="Example testbench code" %}

### Simulator Support

The officially supported simulators ([according to the docs](https://sturla22.github.io/pltbutils/index.html#autotoc_md55)) are `ModelSim`, and `ISim`/`XSim`. I've also had good results with `GHDL`. PlTbUtils does not rely on any language features in VHDL-2008+ which makes it likely to work with many simulators.

## UVVM Utility Library

[UVVM](https://uvvm.org/), which stands for Universal VHDL Verification Methodology is "a free and Open Source Methodology and Library for making very structured VHDL-based testbenches."

The [Utility Library Quick Reference](https://github.com/UVVM/UVVM_Light/blob/master/doc/util_quick_ref.pdf) documentation is helpful with getting an overview of UVVM Utility Library's capabilities. The broad categories presented there are

- Checks and awaits
- Logging and verbosity control
- Alert handling
- Reporting
- Randomization
- String handling
- Signal generators
- Synchronization
- BFM Common Package
- Watchdog

{% capture details %}
{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="Half Adder Testbench Using UVVM"
  dir="includes/vhdl-testbench-library-comparison/"
  file="half_adder_uvvm_tb.vhd"
%}
{% assign listing_num = listing_num | plus: 1 %}
{% endcapture %}
{% include details.html details=details summary="Example testbench code" %}

### Simulator Support

`GHDL` officially supports UVVM and runs [scheduled tests](https://github.com/ghdl/extended-tests) to check that it works.

According to the invitation to the Bitvis course, "Advanced VHDL Verification - Made Simple", at the very least the following simulators are supported: `Questa`/`ModelSim`, and `Active-HDL`/`Riviera-PRO`.

## VUnit VHDL Libraries

[VUnit](https://vunit.github.io/index.html) "features the functionality needed to realize continuous and automated testing" of HDL code and includes several VHDL libraries for convenience but also for integration with their python based run/check system. VUnit provides four utility libraries:

- Logging
- Check
- Run (Watchdog, Testbench Control)
- Communication

VUnit also provides two datastructures:

- Queue
- Integer Array


{% capture details %}
{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="Half Adder Testbench Using VUnit"
  dir="includes/vhdl-testbench-library-comparison/"
  file="half_adder_vunit_tb.vhd"
%}
{% assign listing_num = listing_num | plus: 1 %}
{% endcapture %}
{% include details.html details=details summary="Example testbench code" %}

### Simulator Support

VUnit supports [several simulators](https://vunit.github.io/cli.html#simulator-selection) for their build/run environment, it is safe to assume that their utility libraries work in those as well.

The officially supported simulators are `Active-HDL`/`Riviera-PRO`, `GHDL`, and `ModelSim`.

## Simulator Support Matrix

The difference in simulator support comes down to the language features used by the libraries vs. the language features implemented by the simulator.

I've based the following matrix on the documentation I've found, issues on github and [this list of VHDL simulators](https://en.wikipedia.org/wiki/List_of_HDL_simulators) on Wikipedia.

|                            | OSVVM                                                   | PlTbUtils  | UVVM  | VUnit                                                     |
|---------------------------:|:-------------------------------------------------------:|:----------:|:-----:|:---------------------------------------------------------:|
| **Active-HDL/Riviera-PRO** | Yes                                                     |            | Yes   | Yes                                                       |
| **GHDL**                   | Yes                                                     | Unofficial | Yes   | Yes                                                       |
| **Incisive**               | [No](https://github.com/OSVVM/OSVVM/issues/7)           |            |       | [In Progress?](https://github.com/VUnit/vunit/issues/504) |
| **ModelSim/Questa**        | Yes                                                     | Yes        | Yes   | Yes                                                       |
| **NVC**                    |                                                         |            |       | [In Progress?](https://github.com/VUnit/vunit/issues/44)  |
| **SynaptiCAD**             |                                                         |            |       | [No](https://github.com/VUnit/vunit/issues/261)           |
| **VCS**                    |                                                         |            |       | [In Progress?](https://github.com/VUnit/vunit/issues/134) |
| **ISim/XSim**              |                                                         | Yes        |       | [In Progress?](https://github.com/VUnit/vunit/issues/209) |
| **Xcelium**                | [In Progress?](https://github.com/OSVVM/OSVVM/issues/7) |            |       | [In Progress?](https://github.com/VUnit/vunit/issues/325) |
| **NCSim**                  |                                                         |            |       | [Experimental?](https://github.com/VUnit/vunit/issues/92) |
{%
  include table.html
  description="Simulator Support Matrix"
  table_num=2
%}

It's hard to keep a list like this up to date, so when this has aged like milk [let me know](https://github.com/Sturla22/Sturla22.github.io/discussions/categories/general) and I'll update it.


## Conclusion

It is left up to the reader to pick the libraries that best suit their needs, indeed there is nothing stopping us from using several (or all) of these libraries together. When doing so, be prepared for some naming clashes, for example, VUnit's and PlTbUtils' check procedures.

Personally, I believe the best approach for me will be to rely on VUnit as a base and then add the other libraries as their functionalities are needed, VUnit makes adding OSVVM especially easy as I showed in my post on the [Test Controller]({% post_url 2021-04-02-vhdl-design-patterns-test-controller %}#running) design pattern.

I'll be diving into the Verification Components soon, which is a big part of some of the frameworks mentioned here.

## Changelog

### 2021-04-10

 - Mention cocotb
 - Add information on simulator support after request from [u/threespeedlogic](https://www.reddit.com/r/FPGA/comments/mmz4h5/vhdl_testbench_library_comparison/gtuy115?utm_source=share&utm_medium=web2x&context=3)

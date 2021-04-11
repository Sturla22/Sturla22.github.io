---
layout: post
title: SW Test Methods in VHDL
tags:
    - VHDL
---

When testing SW there are two methods that are primarily used to handle dependencies that are not needed for a test: stubbing and mocking. For embedded SW the dependencies are usually on HW or the MCU's Hardware Abstraction Layer (HAL). For application SW the dependencies are usually one of these: the file system, the internet, or other applications. In short, these dependencies are usually removed and their interface is fulfilled by another, more effective and simpler mechanism. In VHDL the HW interface is nicely abstracted through ports and testbenches without ports are standard industry practice for simulating the effects of HW stimulus on a design. When dealing with the VHDL counterpart of a file system; memory access, mocking may speed up simulations by providing a memory model that is effective for simulations. Finally, VHDL also interfaces with other applications: processing units that either run SW (softcore-CPUs) or are designed to infer information about their inputs in a hard-to-predict manner; AI accelerators or Tensor Processing Units (TPUs). In this post I'll mention stubbing briefly and then cover how to mock a processing unit in VHDL.

{% include toc.html %}

{% assign listing_num = 1 %}

## Stubbing Architectures

[Stubbing](https://en.wikipedia.org/wiki/Test_stub) is when you remove the internals of a dependency, leaving it empty or making it's functionality static (e.g. methods returning constants).

Providing an empty architecture for an entity when simulating an unrelated part of a top-level design may decrease simulation time and setup effort. This also provides a way to force values onto signals which are left dangling once the internals of an architecture are removed.

I'll not go into details on this method since it is trivial to provide an empty architecture, however the same principle applies to replacing the architecture as for the mocked architectures below.

## Mocking Architectures with Shared Variables

[Mocking](https://en.wikipedia.org/wiki/Mock_object) is when you remove the internals of a dependency and replace it with something simpler, which you have more control over. Mocks are dynamic, as opposed to the static nature of stubs.

The `access_type_pkg` is a generic package which takes record definitions for the in-ports and the out-ports of a block as generic parameters.
I've named the methods of the `access_t` type to coincide with the expected usage in testbenches, the `get_outputs` and `set_inputs` are intended to serve as the mechanism internal to the mock, while `get` and `set` are meant to be used in a testbench that makes use of the mock.

{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="Generic access type definition"
  dir="includes/sw-test-methods-in-vhdl/"
  file="access_type_pkg.vhd"
%}
{% assign listing_num = listing_num | plus: 1 %}

Two caveats: You'd probably want to add some synchronization for setting the internal variables if using this approach in multiple processes, and it should be possible to implement the same pattern without using VHDL-2008 features such as generic packages and protected types.

Now we just need to instantiate the generic package, instantiate a shared variable, connect the shared variable to ports inside a mock architecture of the CPU, instrument the CPU through the shared variable in a testbench, and finally make sure that our mocked architecture gets used and not the real architecture. It's best to show these steps in an example, which is provided hereafter.

## Example

Let's assume we have a design that looks like the one shown in Listing {{ listing_num }} below. The design instantiates a CPU and in the `hw_if` block it maps GPIOs, that SW will have control over, to pins on the chip (FPGA or ASIC). It is this `hw_if` block that we are really interested in testing here, and since it has a dependency on the CPU's ports, mocking the CPU frees us from running SW on the CPU in simulations when the only implementation that interests us is outside the CPU.

Note that the CPU is instantiated by using a component declaration, this enables us to swap it out with a configuration in the test bench. However, if your design instantiates a block that you want to mock with an entity instantiation then you'll have to make sure to only compile the mock architecture and not the real architecture, if the entity and real architecture are defined in the same file then you'll have to redefine the entity too.
{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="Example Design"
  dir="includes/sw-test-methods-in-vhdl/"
  file="example_dut.vhd"
%}
{% assign listing_num = listing_num | plus: 1 %}

The CPU itself is not important for this discussion, but here is the empty wrapper. In a real implementation a CPU would be instantiated in the wrapper's architecture and ports mapped as appropriate.
{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="Wrapper for a CPU"
  dir="includes/sw-test-methods-in-vhdl/"
  file="riscv_soc_wrapper.vhd"
%}
{% assign listing_num = listing_num | plus: 1 %}

The ports of the wrapper are two separate records, one for input and another for output, these will be used when instantiating a specific instance of the generic `access_type_pkg`.
{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="CPU port types"
  dir="includes/sw-test-methods-in-vhdl/"
  file="cpu_types_pkg.vhd"
%}
{% assign listing_num = listing_num | plus: 1 %}

Now let's take a look at a testbench and see how we want to instrument the CPU to check the HW Interface logic. Here we instantiate the design under test with a component instantiation, to allow for configuration at the bottom of the testbench. Then we have a mysterious object, `cpu_access`, which acts as the SW that will eventually run on the CPU. Checks of values can be performed as usual, here with VUnit's check library.

{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="A testbench with configuration"
  dir="includes/sw-test-methods-in-vhdl/"
  file="example_tb.vhd"
%}
{% assign listing_num = listing_num | plus: 1 %}

The generic package needs to be instantiated and when doing so we need to provide the appropriate input and output record types. Then the shared variable can be declared based on the specific package, `mock_cpu_type_pkg` in this case.
{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="Declaration of the mock CPU's shared variable"
  dir="includes/sw-test-methods-in-vhdl/"
  file="mock_cpu_pkg.vhd"
%}
{% assign listing_num = listing_num | plus: 1 %}

Finally, we hook into the shared variable in a mock architecture of the CPU wrapper entity, using the internal get and set methods to update the global state.
{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description="The CPU mocked architecture"
  dir="includes/sw-test-methods-in-vhdl/"
  file="mock_cpu.vhd"
%}
{% assign listing_num = listing_num | plus: 1 %}

Here is the VUnit script for completedness, notice that there is no need to have the CPU entity declared in a separate file from it's architecture and removing the CPU architecture from the source list when compiling for these tests. This is the approach that would be needed if the CPU and dut instances had not been instantiated as components.
{%
  include python_code_snippet.html
  listing_num=listing_num
  description="Basic VUnit run script"
  dir="includes/sw-test-methods-in-vhdl/"
  file="run.py"
%}
{% assign listing_num = listing_num | plus: 1 %}

## Conclusion

By mocking CPUs for simulation you get full control over the CPUs inputs and outputs, which provides a way to simulate SW behaviour towards the SW/FW interface. The advantage of this approach as opposed to stubbing and forcing signals is that you can hook up Verification Components from within the CPU and keep complex mimicking of SW behaviour contained within the mock architecture. This mimicking of SW behaviour might include state machines or main-loops with execution times that are much slower than the clock-cycle.

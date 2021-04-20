---
layout: post
title: Where Can I Assert in VHDL?
date: 2021-04-20 21:07 +0200
published: true
tags:
- VHDL
---

After reading Stuart Sutherland's paper "[Who Put Assertions In My RTL Code? And Why? - How RTL Design Engineers Can Benefit from the Use of SystemVerilog Assertions](https://sutherland-hdl.com/papers/2015-SNUG-SV_SVA-for-RTL-Designers_paper.pdf)", I wondered where we can insert assertions in VHDL since the paper focuses on System Verilog.

{% assign listing_num = 1 %}

You could of course study the Language Reference Manual and figure out that assertions can be both concurrent and sequential, and from that intuit where they can be placed. But I think an example conveys the information much better:

{%
  include vhdl_code_snippet.html
  listing_num=listing_num
  description=""
  dir="includes/where-can-i-assert-in-vhdl/"
  file="assert_tb.vhd"
%}
{% assign listing_num = listing_num | plus: 1 %}

The output may be interesting too, since we can see the evaluation order of GHDL:

```
assert_tb.vhd:18:5:@0ms:(assertion note): generic map asssign function procedure call procedure variable declaration function internal
assert_tb.vhd:27:5:@0ms:(assertion note): generic map asssign function procedure call procedure
assert_tb.vhd:33:5:@0ms:(assertion note): generic map asssign function
assert_tb.vhd:18:5:@0ms:(assertion note): in port declaration function procedure call procedure variable declaration function internal
assert_tb.vhd:27:5:@0ms:(assertion note): in port declaration function procedure call procedure
assert_tb.vhd:33:5:@0ms:(assertion note): in port declaration function
assert_tb.vhd:18:5:@0ms:(assertion note): port map assign function procedure call procedure variable declaration function internal
assert_tb.vhd:27:5:@0ms:(assertion note): port map assign function procedure call procedure
assert_tb.vhd:33:5:@0ms:(assertion note): port map assign function
assert_tb.vhd:18:5:@0ms:(assertion note): out port declaration function procedure call procedure variable declaration function internal
assert_tb.vhd:27:5:@0ms:(assertion note): out port declaration function procedure call procedure
assert_tb.vhd:33:5:@0ms:(assertion note): out port declaration function
assert_tb.vhd:18:5:@0ms:(assertion note): inout port declaration function procedure call procedure variable declaration function internal
assert_tb.vhd:27:5:@0ms:(assertion note): inout port declaration function procedure call procedure
assert_tb.vhd:33:5:@0ms:(assertion note): inout port declaration function
assert_tb.vhd:18:5:@0ms:(assertion note): entity constant declaration function procedure call procedure variable declaration function internal
assert_tb.vhd:27:5:@0ms:(assertion note): entity constant declaration function procedure call procedure
assert_tb.vhd:33:5:@0ms:(assertion note): entity constant declaration function
assert_tb.vhd:18:5:@0ms:(assertion note): architecture constant declaration function procedure call procedure variable declaration function internal
assert_tb.vhd:27:5:@0ms:(assertion note): architecture constant declaration function procedure call procedure
assert_tb.vhd:33:5:@0ms:(assertion note): architecture constant declaration function
assert_tb.vhd:18:5:@0ms:(assertion note): architecture signal declaration function procedure call procedure variable declaration function internal
assert_tb.vhd:27:5:@0ms:(assertion note): architecture signal declaration function procedure call procedure
assert_tb.vhd:33:5:@0ms:(assertion note): architecture signal declaration function
assert_tb.vhd:18:5:@0ms:(assertion note): process declaration function procedure call procedure variable declaration function internal
assert_tb.vhd:27:5:@0ms:(assertion note): process declaration function procedure call procedure
assert_tb.vhd:33:5:@0ms:(assertion note): process declaration function
assert_tb.vhd:18:5:@0ms:(assertion note): entity procedure variable declaration function internal
assert_tb.vhd:27:5:@0ms:(assertion note): entity procedure
assert_tb.vhd:18:5:@0ms:(assertion note): entity procedure call function procedure call procedure variable declaration function internal
assert_tb.vhd:27:5:@0ms:(assertion note): entity procedure call function procedure call procedure
assert_tb.vhd:33:5:@0ms:(assertion note): entity procedure call function
assert_tb.vhd:18:5:@0ms:(assertion note): entity function procedure variable declaration function internal
assert_tb.vhd:27:5:@0ms:(assertion note): entity function procedure
assert_tb.vhd:66:3:@0ms:(assertion note): entity
assert_tb.vhd:18:5:@0ms:(assertion note): generate assign procedure variable declaration function internal
assert_tb.vhd:27:5:@0ms:(assertion note): generate assign procedure
assert_tb.vhd:81:5:@0ms:(assertion note): generate
assert_tb.vhd:18:5:@0ms:(assertion note): concurrent procedure variable declaration function internal
assert_tb.vhd:27:5:@0ms:(assertion note): concurrent procedure
assert_tb.vhd:18:5:@0ms:(assertion note): concurrent function procedure call procedure variable declaration function internal
assert_tb.vhd:27:5:@0ms:(assertion note): concurrent function procedure call procedure
assert_tb.vhd:33:5:@0ms:(assertion note): concurrent function
assert_tb.vhd:88:3:@0ms:(assertion note): concurrent
assert_tb.vhd:18:5:@0ms:(assertion note): process procedure variable declaration function internal
assert_tb.vhd:27:5:@0ms:(assertion note): process procedure
assert_tb.vhd:18:5:@0ms:(assertion note): process assign function procedure call procedure variable declaration function internal
assert_tb.vhd:27:5:@0ms:(assertion note): process assign function procedure call procedure
assert_tb.vhd:33:5:@0ms:(assertion note): process assign function
assert_tb.vhd:97:5:@0ms:(assertion note): process
```

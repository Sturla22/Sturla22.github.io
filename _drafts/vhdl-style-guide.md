---
layout: post
title: VHDL Style Guide
tags:
    - VHDL
    - HDL
    - FPGA
    - Tools
---

Similar to clang-tidy or black, but for VHDL.

Docs: [https://vhdl-style-guide.readthedocs.io/en/latest](https://vhdl-style-guide.readthedocs.io/en/latest)

Repository: [https://github.com/jeremiah-c-leary/vhdl-style-guide](https://github.com/jeremiah-c-leary/vhdl-style-guide)

Install: `pip install vsg`

Running on the half adder from [VHDL Test Libraries and Methodologies](vhdl_test_methodologies.html):

`vsg -f half_adder.vhd`

Output:

```
================================================================================
File:  half_adder.vhd
================================================================================
Phase 1 of 7... Reporting
Total Rules Checked: 76
Total Violations:    4
  Error   :     4
  Warning :     0
----------------------------+------------+------------+--------------------------------------
  Rule                      |  severity  |  line(s)   | Solution
----------------------------+------------+------------+--------------------------------------
  port_012                  | Error      |         12 | Remove default assignment in port declaration
  port_012                  | Error      |         13 | Remove default assignment in port declaration
  entity_015                | Error      |         15 | The "end" keyword, "entity" keyword and entity name need to be on the same line.
  architecture_010          | Error      |         21 | Add "architecture" keyword after "end" keyword.
----------------------------+------------+------------+--------------------------------------
NOTE: Refer to online documentation at https://vhdl-style-guide.readthedocs.io/en/latest/index.html for more information.
```
The file, for reference:
```vhdl
{% include half_adder.vhd %}
```

Run: `vsg --fix -f half_adder_fixed.vhd`

```vhdl
{% include half_adder_fixed.vhd.bak %}
```

Output:

```
================================================================================
File:  half_adder_fixed.vhd
================================================================================
Phase 1 of 7... Reporting
Total Rules Checked: 76
Total Violations:    2
  Error   :     2
  Warning :     0
----------------------------+------------+------------+--------------------------------------
  Rule                      |  severity  |  line(s)   | Solution
----------------------------+------------+------------+--------------------------------------
  port_012                  | Error      |         12 | Remove default assignment in port declaration
  port_012                  | Error      |         13 | Remove default assignment in port declaration
----------------------------+------------+------------+--------------------------------------
NOTE: Refer to online documentation at https://vhdl-style-guide.readthedocs.io/en/latest/index.html for more information.
```

The remaining errors can be fixed by hand or you should be able to do:

`vsg -rc port_012 > config.json`

and edit the file to have `"fixable": true` like shown below

```json
{% include config.json %}
```

and then run: `vsg --fix -c config.json -f half_adder_fixed.vhd`

but this doesn't work for this rule it seems:

```
Traceback (most recent call last):
  File "/home/sturlalange/.local/bin/vsg", line 8, in <module>
    sys.exit(main())
  File "/home/sturlalange/.local/lib/python3.8/site-packages/vsg/__main__.py", line 372, in main
    oRules.fix(commandLineArguments.fix_phase, commandLineArguments.skip_phase)
  File "/home/sturlalange/.local/lib/python3.8/site-packages/vsg/rule_list.py", line 152, in fix
    oRule.fix(self.oVhdlFile)
  File "/home/sturlalange/.local/lib/python3.8/site-packages/vsg/rule.py", line 94, in fix
    self._fix_violations(oFile)
AttributeError: 'rule_012' object has no attribute '_fix_violations'
```

Alright, let's fix by hand and run again:

```
================================================================================
File:  half_adder_fixed.vhd
================================================================================
Phase 7 of 7... Reporting
Total Rules Checked: 421
Total Violations:    0
  Error   :     0
  Warning :     0
```

The diff of the start file vs the fixed file is:

```diff
4,5c4,5
< use ieee.std_logic_1164.all;
< use ieee.numeric_std.all;
---
>   use ieee.std_logic_1164.all;
>   use ieee.numeric_std.all;
9,10c9,10
<     i_bit1  : in std_logic;
<     i_bit2  : in std_logic;
---
>     i_bit1 : in    std_logic;
>     i_bit2 : in    std_logic;
12,15c12,15
<     o_sum   : out std_logic := '0';
<     o_carry : out std_logic := '0'
<     );
< end half_adder;
---
>     o_sum   : out   std_logic;
>     o_carry : out   std_logic
>   );
> end entity half_adder;
17a18
>
18a20
>
21c23,24
< end rtl;
---
>
> end architecture rtl;
```

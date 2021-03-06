---
layout: post
title: "An Overview of VHDL-Based Test Methodologies"
tags:
    - VHDL
    - HDL
    - FPGA
    - simulation
    - PlTbUtils
    - UVVM
    - OSVVM
---

This post will compare three open source VHDL verification libraries:

- UVVM (Most popular according to Wilson research)
- OSVVM (Second place according to Wilson)
- PlTbUtils (Not rated in the Wilson research report)

The comparison will be made for testing a simple entity, a half adder. A more advanced entity might be interesting to compare in the future.

```vhdl
library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity half_adder is
  port (
    i_bit1  : in std_logic;
    i_bit2  : in std_logic;
    --
    o_sum   : out std_logic;
    o_carry : out std_logic
    );
end half_adder;

architecture rtl of half_adder is
begin
  o_sum   <= i_bit1 xor i_bit2;
  o_carry <= i_bit1 and i_bit2;
end rtl;
```

The provided test bench looks like this:

```vhdl
library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity half_adder_tb is
end half_adder_tb;

architecture behave of half_adder_tb is
  signal r_BIT1  : std_logic := '0';
  signal r_BIT2  : std_logic := '0';
  signal w_SUM   : std_logic;
  signal w_CARRY : std_logic;
begin

  UUT : entity work.half_adder  -- uses default binding
    port map (
      i_bit1  => r_BIT1,
      i_bit2  => r_BIT2,
      o_sum   => w_SUM,
      o_carry => w_CARRY
      );

  process is
  begin
    r_BIT1 <= '0';
    r_BIT2 <= '0';
    wait for 10 ns;
    r_BIT1 <= '0';
    r_BIT2 <= '1';
    wait for 10 ns;
    r_BIT1 <= '1';
    r_BIT2 <= '0';
    wait for 10 ns;
    r_BIT1 <= '1';
    r_BIT2 <= '1';
    wait for 10 ns;
    wait;
  end process;
end behave;
```

Note that I had to add the last wait to make the simulation stop.

[https://www.edaplayground.com/x/RiYQ](https://www.edaplayground.com/x/RiYQ)

Saving this code in the files half_adder.vhd and half_adder_tb.vhd we can compile and simulate with ghdl:

```bash
ghdl -a half_adder.vhd half_adder_tb.vhd
ghdl -r half_adder_tb
```

This approach to writing testbenches requires that the waveform of the simulation be inspected and compared to what was expected. This hinders automation and good practices such as continuous integration. The following sections will explore three verification libraries which allow for specifying the expected outcomes and checking them.

# UVVM

Implementing this same testbench with UVVM would look like this

[https://www.edaplayground.com/x/cLyB](https://www.edaplayground.com/x/cLyB)

```vhdl
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;

library STD;
use std.env.all;

library uvvm_util;
context uvvm_util.uvvm_util_context;

-- Test case entity
entity half_adder_uvvm_tb is
end entity half_adder_uvvm_tb;

-- Test case architecture
architecture func of half_adder_uvvm_tb is
  signal r_BIT1  : std_logic := '0';
  signal r_BIT2  : std_logic := '0';
  signal w_SUM   : std_logic;
  signal w_CARRY : std_logic;
begin

  -- Instantiate DUT
  i_half_adder: entity work.half_adder
    port map (
        i_bit1  => r_BIT1,
        i_bit2  => r_BIT2,
        o_sum   => w_SUM,
        o_carry => w_CARRY
        );

  p_main: process
    constant C_SCOPE     : string  := C_TB_SCOPE_DEFAULT;
  begin
    -- Print the configuration to the log
    report_global_ctrl(VOID);
    report_msg_id_panel(VOID);
    enable_log_msg(ALL_MESSAGES);
    log(ID_LOG_HDR, "Start Simulation of TB for half adder", C_SCOPE);
    ------------------------------------------------------------

    log(ID_LOG_HDR, "Check defaults on output ports", C_SCOPE);
    ------------------------------------------------------------
    check_value(w_SUM, '0', ERROR, "sum should be zero with no input", C_SCOPE);
    check_value(w_CARRY, '0', ERROR, "carry should be zero with no input", C_SCOPE);

    log(ID_LOG_HDR, "Check logic", C_SCOPE);
    ------------------------------------------------------------
    r_BIT1 <= '0';
    r_BIT2 <= '0';
    wait for 10 ns;
    check_value(w_SUM, '0', ERROR, "sum should be 0 with 00 input", C_SCOPE);
    check_value(w_CARRY, '0', ERROR, "carry should be 0 with 00 input", C_SCOPE);
    r_BIT1 <= '0';
    r_BIT2 <= '1';
    wait for 10 ns;
    check_value(w_SUM, '1', ERROR, "sum should be 1 with 01 input", C_SCOPE);
    check_value(w_CARRY, '0', ERROR, "carry should be 0 with 01 input", C_SCOPE);
    r_BIT1 <= '1';
    r_BIT2 <= '0';
    wait for 10 ns;
    check_value(w_SUM, '1', ERROR, "sum should be 1 with 10 input", C_SCOPE);
    check_value(w_CARRY, '0', ERROR, "carry should be 0 with 10 input", C_SCOPE);
    r_BIT1 <= '1';
    r_BIT2 <= '1';
    wait for 10 ns;
    check_value(w_SUM, '0', ERROR, "sum should be 0 with 11 input", C_SCOPE);
    check_value(w_CARRY, '1', ERROR, "carry should be 1 with 11 input", C_SCOPE);

    -- Ending the simulation
    ------------------------------------------------------------
    wait for 1000 ns; -- to allow some time for completion
    -- Report final counters and print conclusion for simulation (Success/Fail)
    report_alert_counters(FINAL);

    log(ID_LOG_HDR, "SIMULATION COMPLETED", C_SCOPE);

    -- Finish the simulation
    std.env.stop;
    wait; -- to stop completely

  end process p_main;

end func;
```

To build with ghdl I had to build [ghdl v1.0](https://github.com/ghdl/ghdl/releases/tag/v1.0.0) [from sources](https://ghdl.readthedocs.io/en/latest/getting/mcode.html#build-mcode) since 0.37 packaged by PopOS! seems to be missing ieee.numeric_std with —std=08, which is required for the context clause.

Building the uvvm util lib

```bash
/usr/local/bin/ghdl -i -frelaxed-rules --std=08 *.vhd
/usr/local/bin/ghdl -i -frelaxed-rules --work=uvvm_util --std=08 ../UVVM/uvvm_util/src/*.vhd
/usr/local/bin/ghdl -m -frelaxed-rules --std=08 half_adder_uvvm_tb

```

Gives the output

> uvvm_util/src/adaptations_pkg.vhd:70:19:error: type of a shared variable must be a protected type
uvvm_util/src/adaptations_pkg.vhd:70:19:note: (you can use -frelaxed to turn this error into a warning)

As the error hints at, `-frelaxed` is the solution, but it [must be placed after the —std=08 argument](https://ghdl.readthedocs.io/en/latest/quick_start/README.html?highlight=shared#quick-start-guide)

```bash
#!/bin/bash
options="--std=08 -frelaxed"

/usr/local/bin/ghdl -i --work=uvvm_util $options ../UVVM/uvvm_util/src/*.vhd

/usr/local/bin/ghdl -i $options *.vhd
/usr/local/bin/ghdl -m $options half_adder_uvvm_tb

/usr/local/bin/ghdl -r $options half_adder_uvvm_tb
```

This results in error:

```
../UVVM/uvvm_util/src/string_methods_pkg.vhd:1280:36:error: constant interface "val" was not annotated with attribute "element"
../UVVM/uvvm_util/src/string_methods_pkg.vhd:1320:36:error: constant interface "val" was not annotated with attribute "element"
../UVVM/uvvm_util/src/string_methods_pkg.vhd:1360:36:error: constant interface "val" was not annotated with attribute "element"
```

Which seems like a [missing VHDL-2008 feature in the ghdl implementation](https://github.com/ghdl/ghdl/issues/1593), the indicated lines are:

```
val'element'length*val'length +  -- Maximum length of the array elements
-- the type of val is:
type t_slv_array      is array (natural range <>) of std_logic_vector;
```

Changing the val'element'length to 1 in the affected lines allowed me to finally run the test bench.

The output (also stored in file _Log.txt) is

```
 ../UVVM/uvvm_util/src/license_pkg.vhd:57:5:@0ms:(report note):
*****************************************************************************************************
This is a *** LICENSED PRODUCT *** as given in the LICENSE.TXT in the root directory.
*****************************************************************************************************
../UVVM/uvvm_util/src/license_pkg.vhd:86:7:@0ms:(report note):
=====================================================================================================
=====================================================================================================
This info section may be turned off via C_SHOW_UVVM_UTILITY_LIBRARY_INFO in adaptations_pkg.vhd
Important Simulator setup:
- Set simulator to break on severity 'FAILURE'
- Set simulator transcript to a monospace font (e.g. Courier new)
UVVM Utility Library setup:
- It is recommended to go through the two powerpoint presentations provided with the download
- There is a Quick-Reference in the doc-directory
- In order to change layout or behaviour - please check the src*/adaptations_pkg.vhd
This is intended for personal or company customization
License conditions are given in LICENSE.TXT
=====================================================================================================
=====================================================================================================
UVVM:
UVVM: --------------------------------------------------------------------------------------------------------------------------------------------------------------------
UVVM: *** REPORT OF GLOBAL CTRL ***
UVVM: --------------------------------------------------------------------------------------------------------------------------------------------------------------------
UVVM: IGNORE STOP_LIMIT
UVVM: NOTE : REGARD 0
UVVM: TB_NOTE : REGARD 0
UVVM: WARNING : REGARD 0
UVVM: TB_WARNING : REGARD 0
UVVM: MANUAL_CHECK : REGARD 0
UVVM: ERROR : REGARD 1
UVVM: TB_ERROR : REGARD 1
UVVM: FAILURE : REGARD 1
UVVM: TB_FAILURE : REGARD 1
UVVM: --------------------------------------------------------------------------------------------------------------------------------------------------------------------
UVVM:
UVVM:
UVVM: --------------------------------------------------------------------------------------------------------------------------------------------------------------------
UVVM: *** REPORT OF MSG ID PANEL ***
UVVM: --------------------------------------------------------------------------------------------------------------------------------------------------------------------
UVVM: ID Status
UVVM: ------------------------ ------
UVVM: ID_UTIL_BURIED : DISABLED
UVVM: ID_BITVIS_DEBUG : DISABLED
UVVM: ID_UTIL_SETUP : ENABLED
UVVM: ID_LOG_MSG_CTRL : ENABLED
UVVM: ID_ALERT_CTRL : ENABLED
UVVM: ID_FINISH_OR_STOP : ENABLED
UVVM: ID_CLOCK_GEN : ENABLED
UVVM: ID_GEN_PULSE : ENABLED
UVVM: ID_BLOCKING : ENABLED
UVVM: ID_WATCHDOG : ENABLED
UVVM: ID_POS_ACK : ENABLED
UVVM: ID_LOG_HDR : ENABLED
UVVM: ID_LOG_HDR_LARGE : ENABLED
UVVM: ID_LOG_HDR_XL : ENABLED
UVVM: ID_SEQUENCER : ENABLED
UVVM: ID_SEQUENCER_SUB : ENABLED
UVVM: ID_BFM : ENABLED
UVVM: ID_BFM_WAIT : ENABLED
UVVM: ID_BFM_POLL : ENABLED
UVVM: ID_BFM_POLL_SUMMARY : ENABLED
UVVM: ID_CHANNEL_BFM : ENABLED
UVVM: ID_TERMINATE_CMD : ENABLED
UVVM: ID_SEGMENT_INITIATE : ENABLED
UVVM: ID_SEGMENT_COMPLETE : ENABLED
UVVM: ID_SEGMENT_HDR : ENABLED
UVVM: ID_SEGMENT_DATA : ENABLED
UVVM: ID_PACKET_INITIATE : ENABLED
UVVM: ID_PACKET_PREAMBLE : ENABLED
UVVM: ID_PACKET_COMPLETE : ENABLED
UVVM: ID_PACKET_HDR : ENABLED
UVVM: ID_PACKET_DATA : ENABLED
UVVM: ID_PACKET_CHECKSUM : ENABLED
UVVM: ID_PACKET_GAP : ENABLED
UVVM: ID_FRAME_INITIATE : ENABLED
UVVM: ID_FRAME_COMPLETE : ENABLED
UVVM: ID_FRAME_HDR : ENABLED
UVVM: ID_FRAME_DATA : ENABLED
UVVM: ID_COVERAGE_MAKEBIN : DISABLED
UVVM: ID_COVERAGE_ADDBIN : DISABLED
UVVM: ID_COVERAGE_ICOVER : DISABLED
UVVM: ID_COVERAGE_CONFIG : ENABLED
UVVM: ID_COVERAGE_SUMMARY : ENABLED
UVVM: ID_COVERAGE_HOLES : ENABLED
UVVM: ID_UVVM_SEND_CMD : ENABLED
UVVM: ID_UVVM_CMD_ACK : ENABLED
UVVM: ID_UVVM_CMD_RESULT : ENABLED
UVVM: ID_CMD_INTERPRETER : ENABLED
UVVM: ID_CMD_INTERPRETER_WAIT : ENABLED
UVVM: ID_IMMEDIATE_CMD : ENABLED
UVVM: ID_IMMEDIATE_CMD_WAIT : ENABLED
UVVM: ID_CMD_EXECUTOR : ENABLED
UVVM: ID_CMD_EXECUTOR_WAIT : ENABLED
UVVM: ID_CHANNEL_EXECUTOR : ENABLED
UVVM: ID_CHANNEL_EXECUTOR_WAIT : ENABLED
UVVM: ID_NEW_HVVC_CMD_SEQ : ENABLED
UVVM: ID_INSERTED_DELAY : ENABLED
UVVM: ID_OLD_AWAIT_COMPLETION : ENABLED
UVVM: ID_AWAIT_COMPLETION : ENABLED
UVVM: ID_AWAIT_COMPLETION_LIST : ENABLED
UVVM: ID_AWAIT_COMPLETION_WAIT : ENABLED
UVVM: ID_AWAIT_COMPLETION_END : ENABLED
UVVM: ID_UVVM_DATA_QUEUE : ENABLED
UVVM: ID_CONSTRUCTOR : ENABLED
UVVM: ID_CONSTRUCTOR_SUB : ENABLED
UVVM: ID_VVC_ACTIVITY : ENABLED
UVVM: ID_MONITOR : ENABLED
UVVM: ID_MONITOR_ERROR : ENABLED
UVVM: ID_DATA : ENABLED
UVVM: ID_CTRL : ENABLED
UVVM: ID_FILE_OPEN_CLOSE : ENABLED
UVVM: ID_FILE_PARSER : ENABLED
UVVM: ID_SPEC_COV : ENABLED
UVVM: --------------------------------------------------------------------------------------------------------------------------------------------------------------------
UVVM:
UVVM: ID_LOG_MSG_CTRL 0.0 ns TB seq. enable_log_msg(ALL_MESSAGES).
UVVM:
UVVM:
UVVM: ID_LOG_HDR 0.0 ns TB seq. Start Simulation of TB for half adder
UVVM: -------------------------------------------------------------------------------------------------------------------------------------------------------------------------
UVVM:
UVVM:
UVVM: ID_LOG_HDR 0.0 ns TB seq. Check defaults on output ports
UVVM: -------------------------------------------------------------------------------------------------------------------------------------------------------------------------
UVVM: ID_POS_ACK 0.0 ns TB seq. check_value() => OK, for std_logic '0' (exp: '0'). 'sum should be zero with no input'
UVVM: ID_POS_ACK 0.0 ns TB seq. check_value() => OK, for std_logic '0' (exp: '0'). 'carry should be zero with no input'
UVVM:
UVVM:
UVVM: ID_LOG_HDR 0.0 ns TB seq. Check logic
UVVM: -------------------------------------------------------------------------------------------------------------------------------------------------------------------------
UVVM: ID_POS_ACK 10.0 ns TB seq. check_value() => OK, for std_logic '0' (exp: '0'). 'sum should be 0 with 00 input'
UVVM: ID_POS_ACK 10.0 ns TB seq. check_value() => OK, for std_logic '0' (exp: '0'). 'carry should be 0 with 00 input'
UVVM: ID_POS_ACK 20.0 ns TB seq. check_value() => OK, for std_logic '1' (exp: '1'). 'sum should be 1 with 01 input'
UVVM: ID_POS_ACK 20.0 ns TB seq. check_value() => OK, for std_logic '0' (exp: '0'). 'carry should be 0 with 01 input'
UVVM: ID_POS_ACK 30.0 ns TB seq. check_value() => OK, for std_logic '1' (exp: '1'). 'sum should be 1 with 10 input'
UVVM: ID_POS_ACK 30.0 ns TB seq. check_value() => OK, for std_logic '0' (exp: '0'). 'carry should be 0 with 10 input'
UVVM: ID_POS_ACK 40.0 ns TB seq. check_value() => OK, for std_logic '0' (exp: '0'). 'sum should be 0 with 11 input'
UVVM: ID_POS_ACK 40.0 ns TB seq. check_value() => OK, for std_logic '1' (exp: '1'). 'carry should be 1 with 11 input'
UVVM:
UVVM: ====================================================================================================================================================================
UVVM: *** FINAL SUMMARY OF ALL ALERTS ***
UVVM: ====================================================================================================================================================================
UVVM: REGARDED EXPECTED IGNORED Comment?
UVVM: NOTE : 0 0 0 ok
UVVM: TB_NOTE : 0 0 0 ok
UVVM: WARNING : 0 0 0 ok
UVVM: TB_WARNING : 0 0 0 ok
UVVM: MANUAL_CHECK : 0 0 0 ok
UVVM: ERROR : 0 0 0 ok
UVVM: TB_ERROR : 0 0 0 ok
UVVM: FAILURE : 0 0 0 ok
UVVM: TB_FAILURE : 0 0 0 ok
UVVM: ====================================================================================================================================================================
UVVM: >> Simulation SUCCESS: No mismatch between counted and expected serious alerts
UVVM: ====================================================================================================================================================================
UVVM:
UVVM:
UVVM:
UVVM:
UVVM: ID_LOG_HDR 1040.0 ns TB seq. SIMULATION COMPLETED
UVVM: -------------------------------------------------------------------------------------------------------------------------------------------------------------------------
simulation stopped @1040ns
```

It should be noted that a build script for UVVM is available from ghdl: [https://github.com/ghdl/ghdl/blob/master/scripts/vendors/compile-uvvm.sh](https://github.com/ghdl/ghdl/blob/master/scripts/vendors/compile-uvvm.sh)

# PlTbUtils

Adjusting the testbench for PlTbUtils results in

```vhdl
library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

use work.txt_util.all;
use work.pltbutils_func_pkg.all;
use work.pltbutils_comp_pkg.all;

-- Test case entity
entity half_adder_pltb_tb is
end entity half_adder_pltb_tb;

-- Test case architecture
architecture bhv of half_adder_pltb_tb is
  -- Simulation status- and control signals
  -- for accessing .stop_sim and for viewing in waveform window
  signal pltbs          : pltbs_t := C_PLTBS_INIT;

  -- DUT stimuli and response signals
  signal r_BIT1  : std_logic := '0';
  signal r_BIT2  : std_logic := '0';
  signal w_SUM   : std_logic;
  signal w_CARRY : std_logic;
begin

  -- Instantiate DUT
  i_half_adder: entity work.half_adder
    port map (
        i_bit1  => r_BIT1,
        i_bit2  => r_BIT2,
        o_sum   => w_SUM,
        o_carry => w_CARRY
        );

  p_main: process
    variable pltbv  : pltbv_t := C_PLTBV_INIT;
  begin
    starttest(1, "Check defaults on output ports", pltbv, pltbs);
    ------------------------------------------------------------
    check("sum should be zero with no input", w_SUM, '0', pltbv, pltbs);
    check("carry should be zero with no input", w_CARRY, '0', pltbv, pltbs);
    endtest(pltbv, pltbs);

    starttest(2, "Check logic", pltbv, pltbs);
    ------------------------------------------------------------
    r_BIT1 <= '0';
    r_BIT2 <= '0';
    wait for 10 ns;
    check("sum should be 0 with 00 input", w_SUM, '0', pltbv, pltbs);
    check("carry should be 0 with 00 input", w_CARRY, '0', pltbv, pltbs);
    r_BIT1 <= '0';
    r_BIT2 <= '1';
    wait for 10 ns;
    check("sum should be 1 with 01 input", w_SUM, '1', pltbv, pltbs);
    check("carry should be 0 with 01 input", w_CARRY, '0', pltbv, pltbs);
    r_BIT1 <= '1';
    r_BIT2 <= '0';
    wait for 10 ns;
    check("sum should be 1 with 10 input", w_SUM, '1', pltbv, pltbs);
    check("carry should be 0 with 10 input", w_CARRY, '0', pltbv, pltbs);
    r_BIT1 <= '1';
    r_BIT2 <= '1';
    wait for 10 ns;
    check("sum should be 0 with 11 input", w_SUM, '0', pltbv, pltbs);
    check("carry should be 1 with 11 input", w_CARRY, '1', pltbv, pltbs);
    wait for 10 ns;
    endtest(pltbv, pltbs);

    -- Finish the simulation
    endsim(pltbv, pltbs, true);
    wait; -- to stop completely

  end process p_main;

end bhv;
```

Building is done with script

```bash
#!/bin/bash
set -eE
options="--std=08 -frelaxed"

ghdl -i $options ../pltbutils/trunk/src/vhdl/*.vhd

ghdl -i $options *.vhd
ghdl -m $options half_adder_pltb_tb

ghdl -r $options half_adder_pltb_tb
```

and the output is

> Test 1: Check defaults on output ports (0 fs)
Done with test 1: Check defaults on output ports (0 fs)
Test 2: Check logic (0 fs)
Done with test 2: Check logic (50000000 fs)
--- END OF SIMULATION ---
Note: the results presented below are based on the PlTbUtil's check() procedure calls.
The design may contain more errors, for which there are no check() calls.
50 ns
2 Tests
0 Skipped tests
10 Checks
0 Errors
*** SUCCESS ***

No modifications were needed for PlTbUtils as opposed to UVVM which required running the latest ghdl and removing the use of unsupported VHDL-2008 features from the UVVM Utilities lib.

# OSVVM

Adjusting the testbench for OSVVM gives

[https://www.edaplayground.com/x/cu47](https://www.edaplayground.com/x/cu47)

```vhdl
library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

library osvvm;
context osvvm.OsvvmContext;

-- Test case entity
entity half_adder_osvvm_tb is
end entity half_adder_osvvm_tb;

-- Test case architecture
architecture hierarchy of half_adder_osvvm_tb is
  constant TBID : AlertLogIDType := GetAlertLogID("HA_TB", ALERTLOG_BASE_ID);

  -- DUT stimuli and response signals
  signal r_BIT1  : std_logic := '0';
  signal r_BIT2  : std_logic := '0';
  signal w_SUM   : std_logic;
  signal w_CARRY : std_logic;
begin

  -- Instantiate DUT
  i_half_adder: entity work.half_adder
    port map (
        i_bit1  => r_BIT1,
        i_bit2  => r_BIT2,
        o_sum   => w_SUM,
        o_carry => w_CARRY
        );

  Testbench_1 : block
  begin
    p_main: process
    begin
      SetAlertLogName("half_adder_tb") ;
      wait for 0 ns ;   -- make sure all processes have elaborated
      SetLogEnable(DEBUG, TRUE) ;  -- Enable DEBUG Messages for all levels of the hierarchy

      Log("Check defaults on output ports", INFO);
      ------------------------------------------------------------
      AffirmIfEqual(TBID, w_SUM, '0');
      AffirmIfEqual(TBID, w_CARRY, '0');
      wait for 1 ns;

      Log("Check logic", INFO);
      ------------------------------------------------------------
      r_BIT1 <= '0';
      r_BIT2 <= '0';
      wait for 10 ns;
      AffirmIfEqual(TBID, w_SUM, '0');
      AffirmIfEqual(TBID, w_CARRY, '0');
      r_BIT1 <= '0';
      r_BIT2 <= '1';
      wait for 10 ns;
      AffirmIfEqual(TBID, w_SUM, '1');
      AffirmIfEqual(TBID, w_CARRY, '0');
      r_BIT1 <= '1';
      r_BIT2 <= '0';
      wait for 10 ns;
      AffirmIfEqual(TBID, w_SUM, '1');
      AffirmIfEqual(TBID, w_CARRY, '0');
      r_BIT1 <= '1';
      r_BIT2 <= '1';
      wait for 10 ns;
      AffirmIfEqual(TBID, w_SUM, '0');
      AffirmIfEqual(TBID, w_CARRY, '1');

      wait for 1 ns;
      ReportAlerts;
      std.env.stop;
      wait; -- to stop completely

    end process p_main;
  end block Testbench_1;

end hierarchy;
```

The build script is as follows

```bash
#!/bin/bash
set -eE
options="--std=08"

ghdl -i --work=osvvm $options ../OSVVM/*.vhd

ghdl -i $options *.vhd
ghdl -m $options half_adder_osvvm_tb

ghdl -r $options half_adder_osvvm_tb
```

A build script for OSVVM is also provided by ghdl: [https://github.com/ghdl/ghdl/blob/master/scripts/vendors/compile-osvvm.sh](https://github.com/ghdl/ghdl/blob/master/scripts/vendors/compile-osvvm.sh)

The output is

> %% DONE PASSED half_adder_tb Passed: 10 Affirmations Checked: 10 at 42 ns
simulation stopped @42ns

Like for PlTbUtils, no modifications were needed to ghdl but some files were removed from the OSVVM repository to make the build script as simple as possible. The removed files (../OSVVM/VendorCovApiPkg_Aldec.vhd and ../OSVVM/MemoryPkg_2019.vhd) contained duplicates and unsupported language feaures which ghdl complained about.

# The differences so far

[https://www.edaplayground.com/x/Ayfa](https://www.edaplayground.com/x/Ayfa)

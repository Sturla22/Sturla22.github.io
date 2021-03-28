--! \file test_controller.vhd

library ieee;
  use ieee.std_logic_1164.all;

library OSVVM;
  context OSVVM.OsvvmContext;


--! \brief Test Controller for 'half_adder'.
entity test_controller is
  generic(
    -- Template: Generics that you want to be able to configure.
    runner_cfg: string;
    fail: boolean := false
  );
  port(
    -- Template: DUT Interface Signals, i.e. the ports you want to use to access your design under test.
    --           Set them to inout mode.
    bit1: inout std_logic;
    bit2: inout std_logic;

    sum: inout std_logic;
    carry: inout std_logic

    -- Template: Global Signals, i.e. signals like clock or reset.
  );
end entity test_controller;

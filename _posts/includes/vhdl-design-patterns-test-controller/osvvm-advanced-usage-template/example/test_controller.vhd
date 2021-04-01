--! \file test_controller.vhd

library ieee;
  use ieee.std_logic_1164.all;

library OSVVM;
  context OSVVM.OsvvmContext;


--! \brief Test Controller for 'example'.
entity test_controller is
  generic(
    -- Template: Generics that you want to be able to configure.
    --           runner_cfg for VUnit included by default.
    --           runner_cfg: string
  );
  port(
    -- Template: DUT Interface Signals, i.e. the ports you want to use to access your design under test.
    --           Set them all to inout mode.
    --           s: inout std_logic

    -- Template: Global Signals, i.e. signals like clock or reset.
  );
end entity test_controller;

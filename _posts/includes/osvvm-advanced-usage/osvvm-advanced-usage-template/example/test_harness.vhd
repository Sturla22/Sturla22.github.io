--! \file test_harness.vhd

library ieee;
  use ieee.std_logic_1164.all;

library OSVVM;
  context OSVVM.OsvvmContext;

--! \brief Test harness for 'example'.
entity example_tb is
  generic(
    -- Template: runner_cfg: string
  );
end entity example_tb;

--! \brief Connect the test_controller to the DUT.
architecture test_harness of example_tb is

  -- Template: Define the Global Signals.

  --! \brief Stimulus generation and synchronization
  component test_controller is
    generic(
      -- Template: Generics.
      --           runner_cfg: string
    );
    port(
      -- Template: DUT Interface Signals.
      --           s: inout std_logic

      -- Template: Global Signals.
    );
  end component test_controller;

  -- Template: Define the DUT Interface Signals.
  --           signal s: std_logic;

begin
  -- Template: Generate any global signals,
  --           e.g. OSVVM's CreateClock and CreateReset.

  -- Template: Hook up your design under test to the test_controller component.
  dut: entity work.example
    port map(
      -- Template: s => s
    );

  test_controller_1: component test_controller
    generic map(
      -- Template: Generics.
      --           runner_cfg => runner_cfg
    )
    port map(
      -- Template: DUT Interface Signals.
      --           s => s

      -- Template: Global Signals.
    );
end architecture test_harness;

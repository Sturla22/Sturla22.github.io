--! \file test_harness.vhd

library ieee;
  use ieee.std_logic_1164.all;

library OSVVM;
  context OSVVM.OsvvmContext;

--! \brief Test harness for 'half_adder'.
entity half_adder_tb is
  generic(
    fail: boolean := true
  );
end entity half_adder_tb;

--! \brief Connect the test_controller to the DUT.
architecture test_harness of half_adder_tb is

  -- Template: Define the Global Signals.

  --! \brief Stimulus generation and synchronization
  component test_controller is
    generic(
      -- Template: Generics.
      fail: boolean
    );
    port(
      -- Template: DUT Interface Signals.
      bit1: inout std_logic;
      bit2: inout std_logic;

      sum: inout std_logic;
      carry: inout std_logic

      -- Template: Global Signals.
    );
  end component test_controller;

  -- Template: Define the DUT Interface Signals.
  signal bit1: std_logic;
  signal bit2: std_logic;
  signal sum: std_logic;
  signal carry: std_logic;

begin
  -- Template: Generate any global signals,
  --           e.g. OSVVM's CreateClock and CreateReset.

  -- Template: Hook up your design under test to the test_controller component.
  dut: entity work.half_adder
    port map(
      i_bit1 => bit1,
      i_bit2 => bit2,
      o_sum => sum,
      o_carry => carry
    );

  test_controller_1: component test_controller
    generic map(
      -- Template: Generics.
      fail => fail
    )
    port map(
      -- Template: DUT Interface Signals.
      bit1 => bit1,
      bit2 => bit2,
      sum => sum,
      carry => carry

      -- Template: Global Signals.
    );
end architecture test_harness;

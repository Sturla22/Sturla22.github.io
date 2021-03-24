--! \file half_adder_pltb_tb.vhd

library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

library pltbutils;
use pltbutils.txt_util.all;
use pltbutils.pltbutils_func_pkg.all;
use pltbutils.pltbutils_comp_pkg.all;

-- Test case entity
entity half_adder_pltb_tb is
end entity;

-- Test case architecture
architecture behave of half_adder_pltb_tb is
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
        o_carry => w_CARRY);

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

end architecture;

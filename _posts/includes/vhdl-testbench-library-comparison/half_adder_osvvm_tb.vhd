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

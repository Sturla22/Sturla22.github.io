library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;

library STD;
use std.env.all;

library uvvm_util;
context uvvm_util.uvvm_util_context;

-- Test case entity
entity half_adder_uvvm_tb is
    generic (
        G_DEBUG : integer := 0);
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
    if G_DEBUG > 0 then
        report_global_ctrl(VOID);
        report_msg_id_panel(VOID);
        enable_log_msg(ALL_MESSAGES);
    end if;
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

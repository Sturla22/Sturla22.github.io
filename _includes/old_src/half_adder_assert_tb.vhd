--! \file  half_adder_assert_tb.vhd

library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

library std;
use std.textio.all;
-- use std.env.all;

entity half_adder_assert_tb is
end entity;

architecture behave of half_adder_assert_tb is
  signal r_BIT1  : std_logic := '0';
  signal r_BIT2  : std_logic := '0';
  signal w_SUM   : std_logic;
  signal w_CARRY : std_logic;

  shared variable assert_cnt: integer := 0;
begin
  UUT : entity work.half_adder
  port map (
    i_bit1  => r_BIT1,
    i_bit2  => r_BIT2,
    o_sum   => w_SUM,
    o_carry => w_CARRY
  );

  process is       
    procedure print(
      s: String) is
      variable l: line;
    begin
      write(l, s);
      writeline(output, l);
    end procedure;

    procedure check(
      name: String;
      value: std_logic;
      expected: std_logic;
      description: String) is
    begin
      assert_cnt := assert_cnt + 1;
      print("(" & integer'image(assert_cnt) & "): " & description);
      assert value = expected
      report "(" & integer'image(assert_cnt) & "): " & name &
        " should be " & std_logic'image(expected) &
        " but was: " & std_logic'image(value)
      severity failure;
    end procedure;
  begin

    print("Start Simulation of TB for half adder");
    wait for 0 ns;

    print("Check defaults on output ports");
    check(
      name => "sum", 
      value => w_SUM,
      expected => '0',
      description => "sum should be zero with no input");
    check(
      name => "carry", 
      value => w_CARRY,
      expected => '0',
      description => "carry should be zero with no input");
    wait for 10 ns;

    print("Check logic");
    r_BIT1 <= '0';
    r_BIT2 <= '0';
    wait for 10 ns;
    check(
      name => "sum", 
      value => w_SUM,
      expected => '0',
      description => "sum is '0' with inputs " &
        std_logic'image(r_BIT1) & " and " & std_logic'image(r_BIT2));
    check(
      name => "carry", 
      value => w_CARRY,
      expected => '0',
      description => "carry is '0' with inputs " &
        std_logic'image(r_BIT1) & " and " & std_logic'image(r_BIT2));

    r_BIT1 <= '0';
    r_BIT2 <= '1';
    wait for 10 ns;
    check(
      name => "sum", 
      value => w_SUM,
      expected => '1',
      description => "sum is '1' with inputs " &
        std_logic'image(r_BIT1) & " and " & std_logic'image(r_BIT2));
    check(
      name => "carry", 
      value => w_CARRY,
      expected => '0',
      description => "carry is '0' with inputs " &
        std_logic'image(r_BIT1) & " and " & std_logic'image(r_BIT2));

    r_BIT1 <= '1';
    r_BIT2 <= '0';
    wait for 10 ns;
    check(
      name => "sum", 
      value => w_SUM,
      expected => '1',
      description => "sum is '1' with inputs " &
        std_logic'image(r_BIT1) & " and " & std_logic'image(r_BIT2));
    check(
      name => "carry", 
      value => w_CARRY,
      expected => '0',
      description => "carry is '0' with inputs " &
        std_logic'image(r_BIT1) & " and " & std_logic'image(r_BIT2));

    r_BIT1 <= '1';
    r_BIT2 <= '1';
    wait for 10 ns;
    check(
      name => "sum", 
      value => w_SUM,
      expected => '0',
      description => "sum is '0' with inputs " &
        std_logic'image(r_BIT1) & " and " & std_logic'image(r_BIT2));
    check(
      name => "carry", 
      value => w_CARRY,
      expected => '1',
      description => "carry is '1' with inputs " &
        std_logic'image(r_BIT1) & " and " & std_logic'image(r_BIT2));

    wait for 1 ns;
    print("SIMULATION COMPLETED");
    -- std.env.stop;
    wait;
  end process;
end behave;

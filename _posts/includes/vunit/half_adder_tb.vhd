--! \file: half_adder_tb.vhd

library ieee;
  use ieee.std_logic_1164.all;
  use ieee.numeric_std.all;

library vunit_lib;
  context vunit_lib.vunit_context;

entity half_adder_tb is
  generic (
    runner_cfg : string;
    fail : boolean := false
  );
  signal r_BIT1  : std_logic := '0';
  signal r_BIT2  : std_logic := '0';
  signal w_SUM   : std_logic;
  signal w_CARRY : std_logic;
end entity half_adder_tb;

architecture test of half_adder_tb is
begin
  UUT : entity work.half_adder
    port map (
      i_bit1  => r_BIT1,
      i_bit2  => r_BIT2,
      o_sum   => w_SUM,
      o_carry => w_CARRY
    );

  main : process is

    --! \test Output port defaults
    procedure test_output_port_defaults is
    begin
      assert w_SUM = '0'
        report "sum should be zero with no input"
        severity error;
      assert w_CARRY = '0'
        report "carry should be zero with no input"
        severity error;
      wait for 10 ns;
    end procedure test_output_port_defaults;

    --! \test Logic
    procedure test_logic is
    begin
      r_BIT1 <= '0';
      r_BIT2 <= '0';
      wait for 10 ns;
      assert w_SUM = '0'
        report "sum should be '0' with inputs " &
               std_logic'image(r_BIT1) & " and " &
               std_logic'image(r_BIT2)
        severity error;
      assert w_CARRY = '0'
        report "carry should be '0' with inputs " &
               std_logic'image(r_BIT1) & " and " &
               std_logic'image(r_BIT2)
        severity error;

      r_BIT1 <= '0';
      r_BIT2 <= '1';
      wait for 10 ns;
      assert w_SUM = '1'
        report "sum should be '1' with inputs " &
               std_logic'image(r_BIT1) & " and " &
               std_logic'image(r_BIT2)
        severity error;
      assert w_CARRY = '0'
        report "carry should be '0' with inputs " &
               std_logic'image(r_BIT1) & " and " &
               std_logic'image(r_BIT2)
        severity error;

      r_BIT1 <= '1';
      r_BIT2 <= '0';
      wait for 10 ns;
      assert w_SUM = '1'
        report "sum should be '1' with inputs " &
               std_logic'image(r_BIT1) & " and " &
               std_logic'image(r_BIT2)
        severity error;
      assert w_CARRY = '0'
        report "carry should be '0' with inputs " &
               std_logic'image(r_BIT1) & " and " &
               std_logic'image(r_BIT2)
        severity error;

      r_BIT1 <= '1';
      r_BIT2 <= '1';
      wait for 10 ns;
      assert w_SUM = '0'
        report "sum should be '0' with inputs " &
               std_logic'image(r_BIT1) & " and " &
               std_logic'image(r_BIT2)
        severity error;
      if not fail then
        assert w_CARRY = '1'
          report "carry should be '1' with inputs " &
                 std_logic'image(r_BIT1) & " and " &
                 std_logic'image(r_BIT2)
          severity error;
      else
        -- Note(sl): Intentionally wrong check for demonstration purposes.
        assert w_CARRY = '0'
          report "carry should be '1' with inputs " &
                 std_logic'image(r_BIT1) & " and " &
                 std_logic'image(r_BIT2)
          severity error;
      end if;
    end procedure test_logic;
  begin
    test_runner_setup(runner, runner_cfg);

    while test_suite loop

      if run("output_port_defaults") then
        test_output_port_defaults;
      end if;

      if run("logic") then
        test_logic;
      end if;

    end loop;

    test_runner_cleanup(runner);
  end process main;
end architecture test;

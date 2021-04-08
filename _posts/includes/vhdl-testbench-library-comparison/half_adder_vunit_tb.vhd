-- file: half_adder_vunit_tb.vhd

library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

library vunit_lib;
context vunit_lib.vunit_context;

entity half_adder_vunit_tb is
  generic (runner_cfg : string);
end entity;

architecture tb of half_adder_vunit_tb is
  signal r_BIT1  : std_logic := '0';
  signal r_BIT2  : std_logic := '0';
  signal w_SUM   : std_logic;
  signal w_CARRY : std_logic;
begin
  UUT : entity work.half_adder
    port map (
      i_bit1  => r_BIT1,
      i_bit2  => r_BIT2,
      o_sum   => w_SUM,
      o_carry => w_CARRY
    );

  main : process
  begin
    test_runner_setup(runner, runner_cfg);

    while test_suite loop

        if run("Check defaults on output ports") then
            check(w_SUM = '0', "sum should be zero with no input");
            check(w_CARRY = '0', "carry should be zero with no input");
            wait for 10 ns;
        end if;

        if run("Check logic") then
            r_BIT1 <= '0';
            r_BIT2 <= '0';
            wait for 10 ns;
            check(w_SUM = '0', "sum is '0' with inputs " &
                std_logic'image(r_BIT1) & " and " & std_logic'image(r_BIT2));
            check(w_CARRY = '0', "carry is '0' with inputs " &
                std_logic'image(r_BIT1) & " and " & std_logic'image(r_BIT2));

            r_BIT1 <= '0';
            r_BIT2 <= '1';
            wait for 10 ns;
        check(w_SUM = '1', "sum is '1' with inputs " &
            std_logic'image(r_BIT1) & " and " & std_logic'image(r_BIT2));
        check(w_CARRY = '0', "carry is '0' with inputs " &
            std_logic'image(r_BIT1) & " and " & std_logic'image(r_BIT2));

            r_BIT1 <= '1';
            r_BIT2 <= '0';
            wait for 10 ns;
            check(w_SUM = '1', "sum is '1' with inputs " &
                std_logic'image(r_BIT1) & " and " & std_logic'image(r_BIT2));
            check(w_CARRY = '0', "carry is '0' with inputs " &
                std_logic'image(r_BIT1) & " and " & std_logic'image(r_BIT2));

            r_BIT1 <= '1';
            r_BIT2 <= '1';
            wait for 10 ns;
            check(w_SUM = '0', "sum is '0' with inputs " &
                std_logic'image(r_BIT1) & " and " & std_logic'image(r_BIT2));
            check(w_CARRY = '1', "carry is '1' with inputs " &
                std_logic'image(r_BIT1) & " and " & std_logic'image(r_BIT2));
      end if;
    end loop;

    test_runner_cleanup(runner);
  end process;
end architecture;

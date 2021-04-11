library ieee;
  use ieee.std_logic_1164.all;

library vunit_lib;
  context vunit_lib.vunit_context;

library osvvm;
  context osvvm.OsvvmContext;

use work.cpu_types_pkg.all;
use work.mock_cpu_pkg.cpu_access;

entity example_tb is
  generic (runner_cfg : string);
end entity;

architecture test of example_tb is
  component example_dut is
    port(
      rst_n: in std_logic;
      clk: in std_logic;

      some_input: in std_logic;
      some_output: out std_logic
    );
  end component;

  signal rst_n: std_logic := '1';
  signal clk: std_logic := '0';

  signal some_input: std_logic := '0';
  signal some_output: std_logic := 'Z';

  constant CLOCK_PERIOD : time := 1 sec/100e6;
begin
  CreateClock(clk, CLOCK_PERIOD);

  CreateReset(
    Reset=>rst_n,
    ResetActive=>'0', -- active low
    Clk=>clk,
    Period=>2*CLOCK_PERIOD,
    tpd=>CLOCK_PERIOD
  );

  dut_instance : example_dut
    port map(
      rst_n => rst_n,
      clk => clk,
      some_input => some_input,
      some_output => some_output
    );

  main : process is
    variable inputs: cpu_in_ports_t;
    variable outputs: cpu_out_ports_t := CPU_OUT_PORTS_INIT;
  begin
    test_runner_setup(runner, runner_cfg);

    while test_suite loop

      WaitForToggle(rst_n); -- high to low
      WaitForToggle(rst_n); -- low to high

      if run("check_inputs") then
        inputs := cpu_access.get;
        check_equal(inputs.i_rst, '0', "Reset received");
      elsif run("apply_outputs") then
        outputs.o_gpio(1) := '1';
        cpu_access.set(outputs);
        WaitForClock(clk, 1);
        check_equal(some_output, 'Z');

        outputs.o_gpio_dir(1) := '1';
        cpu_access.set(outputs);
        WaitForClock(clk, 1);
        check_equal(some_output, '1');
      end if;

    end loop;

    test_runner_cleanup(runner);
  end process;
end architecture;

configuration example_tb_mock_cpu of example_tb is
  for test -- arch
    for dut_instance: example_dut
      use entity work.example_dut(rtl);
      for rtl -- arch
        for cpu: riscv_soc_wrapper
          use entity work.riscv_soc_wrapper(mock);
        end for;
      end for;
    end for;
  end for;
end configuration;

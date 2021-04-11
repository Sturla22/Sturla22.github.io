library ieee;
  use ieee.std_logic_1164.all;

use work.cpu_types_pkg.all;

entity example_dut is
  port(
    rst_n: in std_logic;
    clk: in std_logic;

    some_input: in std_logic;
    some_output: out std_logic
  );
end entity;

architecture rtl of example_dut is
  component riscv_soc_wrapper is
    port(
      inputs: in cpu_in_ports_t;
      outputs: out cpu_out_ports_t
    );
  end component;

  signal inputs : cpu_in_ports_t := CPU_IN_PORTS_INIT;
  signal outputs : cpu_out_ports_t := CPU_OUT_PORTS_INIT;
begin
  hw_if: block
  begin
    inputs.i_rst <= not rst_n;
    inputs.i_clk <= clk;
    inputs.i_gpio(0) <= some_input when outputs.o_gpio_dir(0) = '0' else 'X';

    some_output <= outputs.o_gpio(1) when outputs.o_gpio_dir(1) = '1' else 'Z';
  end block;

  cpu: riscv_soc_wrapper
  port map(
    inputs => inputs,
    outputs => outputs
  );
end architecture;

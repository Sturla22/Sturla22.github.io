library ieee;
  use ieee.std_logic_1164.all;

use work.cpu_types_pkg.CPU_OUT_PORTS_INIT;
use work.mock_cpu_pkg.cpu_access;

architecture mock of riscv_soc_wrapper is
begin
  main: process(inputs.i_clk) is
  begin
    if rising_edge(inputs.i_clk) then
      if inputs.i_rst = '1' then
        cpu_access.set(CPU_OUT_PORTS_INIT);
      else
        cpu_access.set_inputs(inputs);
        outputs <= cpu_access.get_outputs;
      end if;
    end if;
  end process;
end architecture;

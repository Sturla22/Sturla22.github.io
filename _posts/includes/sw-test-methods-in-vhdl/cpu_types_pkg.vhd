-- Loosely based on riscv soc:
-- https://github.com/sergeykhbr/riscv_vhdl/blob/master/rtl/work/riscv_soc.vhd
library ieee;
  use ieee.std_logic_1164.all;

package cpu_types_pkg is

    type cpu_in_ports_t is record
      i_rst :std_logic;
      i_clk  :std_logic;
      i_gpio     :std_logic_vector(11 downto 0);
    end record;

    type cpu_out_ports_t is record
      o_gpio     :std_logic_vector(11 downto 0);
      o_gpio_dir :std_logic_vector(11 downto 0); -- '1' for output, '0' for input
    end record;

    constant CPU_OUT_PORTS_INIT: cpu_out_ports_t := (
      o_gpio => (others => '0'),
      o_gpio_dir => (others => '0')
    );

    constant CPU_IN_PORTS_INIT: cpu_in_ports_t := (
      i_rst => 'Z',
      i_clk => 'Z',
      i_gpio => (others => 'Z')
    );

end package;

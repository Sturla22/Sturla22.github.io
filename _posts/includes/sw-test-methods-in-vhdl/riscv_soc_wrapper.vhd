use work.cpu_types_pkg.all;

entity riscv_soc_wrapper is
  port(
    inputs: in cpu_in_ports_t;
    outputs: out cpu_out_ports_t
  );
end entity;

architecture rtl of riscv_soc_wrapper is
begin
  -- Real imlementation, not important for this demonstration.
end architecture;

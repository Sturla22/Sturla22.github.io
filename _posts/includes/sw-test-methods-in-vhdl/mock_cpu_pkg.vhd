use work.cpu_types_pkg.all;

package mock_cpu_type_pkg is new work.access_type_pkg
    generic map (T_in => cpu_in_ports_t, T_out => cpu_out_ports_t);

package mock_cpu_pkg is
    shared variable cpu_access: work.mock_cpu_type_pkg.access_t;
end package;

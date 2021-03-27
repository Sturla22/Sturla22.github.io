library vunit_lib;
  context vunit_lib.vunit_context;

entity tb is
  generic (runner_cfg : string);
end entity;

architecture test of tb is
begin
  main : process is
  begin
    test_runner_setup(runner, runner_cfg);
    -- Your tests here.
    test_runner_cleanup(runner);
  end process;
end architecture;

package pkg is
  -- severity note is set on all assertions so the reports will show up without stopping
  constant severity_lvl: severity_level := note;

  procedure procedure_assert(fail: boolean; description: string);
  function function_assert(fail: boolean; description: string) return boolean;

  constant something_to_assert: boolean := false;

  -- Can't assert directly here:
  -- assert something_to_assert report "entity" severity severity_lvl;
end package pkg;

package body pkg is
  -- Internal function to avoid circular dependency of function_assert and procedure_assert.
  function function_assert_internal(fail: boolean; description: string) return boolean is
  begin
    assert fail report description & " function internal" severity severity_lvl;
    return fail;
  end function;

  procedure procedure_assert(fail: boolean; description: string) is
    variable function_assert_result: boolean := function_assert_internal(
      fail, description & " procedure variable declaration"
    );
  begin
    assert fail report description & " procedure" severity severity_lvl;
  end procedure;

  function function_assert(fail: boolean; description: string) return boolean is
  begin
    procedure_assert(fail, description & " function procedure call");
    assert fail report description & " function" severity severity_lvl;
    return fail;
  end function;
end package body;

  use work.pkg.all;

entity dut is
  generic(
    a_generic: boolean := function_assert(something_to_assert, "generic declaration")
  );
  port(
    input: in boolean := function_assert(something_to_assert, "in port declaration");
    output: out boolean := function_assert(something_to_assert, "out port declaration");
    inoutput: inout boolean := function_assert(something_to_assert, "inout port declaration")
  );
  constant C_FUNCTION_ASSERT_RESULT_ENTITY: boolean := function_assert(
    something_to_assert, "entity constant declaration"
  );
  -- shared variables of protected types allowed too
  -- Can't assert directly here:
  -- assert something_to_assert report "entity" severity severity_lvl;
begin
  procedure_assert(something_to_assert, "entity");
  procedure_assert(
    function_assert(
      something_to_assert, "entity procedure call"
    ),
    "entity function"
  );
  assert something_to_assert report "entity" severity severity_lvl;
end;

architecture none of dut is
  constant C_FUNCTION_ASSERT_RESULT_ARCHITECTURE: boolean := function_assert(
    something_to_assert, "architecture constant declaration"
  );
  signal function_assert_result: boolean := function_assert(
    something_to_assert, "architecture signal declaration"
  );
  -- Can't assert directly here:
  -- assert something_to_assert report "entity" severity severity_lvl;
begin
  g: if true generate
    procedure_assert(something_to_assert, "generate assign");
    assert something_to_assert report "generate" severity severity_lvl;
  else generate
    assert something_to_assert report "not generated" severity severity_lvl;
  end generate;

  procedure_assert(something_to_assert, "concurrent");
  function_assert_result <= function_assert(something_to_assert, "concurrent");
  assert something_to_assert report "concurrent" severity severity_lvl;

  p: process is
    variable v_function_assert_result: boolean := function_assert(
      something_to_assert, "process declaration"
    );
  begin
    procedure_assert(something_to_assert, "process");
    v_function_assert_result := function_assert(something_to_assert, "process assign");
    assert something_to_assert report "process" severity severity_lvl;
    wait;
  end process;
end;

library vunit_lib;
  context vunit_lib.vunit_context;

  use work.pkg.all;

entity generic_assert_tb is
  generic(runner_cfg: string);
end;

architecture test of generic_assert_tb is
  signal stop_test: boolean:= false;
  signal clk: boolean:= false;
begin
  i: entity work.dut
    generic map(
      a_generic => function_assert(something_to_assert, "generic map asssign")
    )
    port map(
      input => function_assert(something_to_assert, "port map assign"),
      output => open,
      inoutput => open
    );

  main: process is
  begin
    test_runner_setup(runner, runner_cfg);
    test_runner_cleanup(runner);
  end process;
end;

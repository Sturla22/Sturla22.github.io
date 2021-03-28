--! \file test_case_1.vhd

-- Template: Add the two lines below to run with VUnit.
--           library vunit_lib;
--             context vunit_lib.vunit_context;

--! \brief Test that thing we need to test.
--! \test First test of many.
architecture test_case_1 of test_controller is
  signal test_done : integer_barrier := 1;
  signal setup_done : integer_barrier := 1;
begin

  --! \brief Set up logging and wait for end of test.
  control_process: process is
    constant TIMEOUT: time := 10 ms;
  begin
    -- Template: Add the line below to run with VUnit.
    --           test_runner_setup(runner, runner_cfg);

    -- Init logs.
    SetAlertLogName("example_tb_test_case_1");

    -- Wait for testbench init.
    wait for 0 ns;  wait for 0 ns;

    -- Template: Wait for design to init, e.g. wait until reset = '0'.

    WaitForBarrier(setup_done);

    -- Wait for test to finish.
    WaitForBarrier(test_done, TIMEOUT);
    AlertIf(now >= TIMEOUT, "Test finished due to timeout");
    AlertIf(GetAffirmCount < 1, "Test is not Self-Checking");

    ReportAlerts;
    -- Template: Add the line below to make the test fail when running with VUnit.
    --           check(GetAlertCount = 0, "OSVVM detected errors");

    -- Template: Add the line below to run with VUnit.
    --           test_runner_cleanup(runner);
  end process control_process;

  --! \brief Executes tests.
  check_process: process is
    -- Template: Variables...
  begin
    WaitForBarrier(setup_done);
    -- Template: Interact with your design under test and check results.
    --           i.e. OSVVM's AffirmIf and friends.
    --           s <= '0';
    --           wait for 1 ns;
    --           AffirmIf(s = '0', "simplest example");

    WaitForBarrier(test_done);
    wait;
  end process check_process;
end architecture test_case_1;

--! \brief Configure testbench.
--! \details We set the architecture of the test_controller component in
--!          the test_harness to be test_case_1 which we defined
--!          in this file.
configuration example_tb_test_case_1 of example_tb is
  for test_harness
    for test_controller_1 : test_controller
      use entity work.test_controller(test_case_1);
    end for;
  end for;
end configuration example_tb_test_case_1;

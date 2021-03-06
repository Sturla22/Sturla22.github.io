import invoke


@invoke.task
def tb_build(ctx, test_bench, ghdl="ghdl", options="", workdir="_work"):
    options += f"--workdir={workdir} -P{workdir}"

    ctx.run(f"{ghdl} -i {options} half_adder.vhd {test_bench}.vhd")
    ctx.run(f"{ghdl} -m {options} {test_bench}")

    ctx.run(
        f"{ghdl} -r {options} {test_bench} --vcd={test_bench}.vcd | tee {test_bench}.txt"
    )


@invoke.task
def lib_build(ctx, lib_src, ghdl="ghdl", lib_name="work", options="", workdir="_work"):
    options += f"--workdir={workdir} -P{workdir}"
    options += f"--work={lib_name}"

    ctx.run(f"{ghdl} -i {options} {lib_src}")


@invoke.task
def cov_build(ctx, test_bench, ghdl="ghdl", options="", workdir="_work"):
    options += f"--workdir={workdir} -P{workdir}"

    ctx.run(
        f"{ghdl} -a {options} -g -fprofile-arcs -ftest-coverage half_adder.vhd {test_bench}.vhd"
    )

    ctx.run(f"{ghdl} -e {options} -Wl,-lgcov -Wl,--coverage {test_bench}")

    ctx.run(
        f"{ghdl} -r {options} {test_bench} --vcd={test_bench}.vcd | tee {test_bench}.txt"
    )

    ctx.run(f"covr --gcov-executable gcov-9 | tee {test_bench}_coverage.txt")

    ctx.run(f"rm -f *.o *.gcno *.gcda")

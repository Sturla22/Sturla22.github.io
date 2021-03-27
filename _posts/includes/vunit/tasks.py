"""!
@file tasks.py

@brief Invoke tasks.
"""
import invoke
import vunit
import run_vunit


@invoke.task
def run(ctx):
    cli = vunit.VUnitCLI()
    vu = vunit.VUnit.from_args(cli.parse_args(["-o=_work"]))
    l = run_vunit.Library(vu)
    # Manipulate library if needed.
    l.setup()
    vu.main()

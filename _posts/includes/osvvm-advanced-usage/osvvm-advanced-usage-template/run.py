#!/bin/env python
"""!
@file: run.py

Based on http://sturla22.github.io/2021/03/27/vunit.html#configuring-compilation-and-tests

Run tests with: ./run.py --with-attributes .run
"""
import vunit
import pathlib

project_dir = pathlib.Path(__file__).parent


class Library:
    def __init__(self, vu):
        """
        Create the VUnit library.
        """
        vu.add_osvvm()
        # Note that the library name 'work' is not allowed.
        self.lib = vu.add_library("lib")
        self.ghdl_common_flags = ["--std=08"]
        self.sources = [project_dir / "example" / "*.vhd"]

    def setup(self):
        """
        Add sources and configure library.
        """
        self.add_sources()
        self.configure_compile()
        self.configure_run()

    def add_sources(self):
        """
        Point VUnit to the source files.
        """
        for s in self.sources:
            if "*" in str(s.as_posix()):
                self.lib.add_source_files(s)
            else:
                self.lib.add_source_file(s)

    def configure_compile(self):
        """
        Configure how VUnit builds the design and tests.
        """
        self.lib.add_compile_option("ghdl.a_flags", self.ghdl_common_flags)

    def configure_run(self):
        """
        Configure how VUnit runs the tests.
        """
        self.lib.set_sim_option("ghdl.elab_flags", self.ghdl_common_flags)
        # Find test bench in lib
        tb = self.lib.test_bench("example_tb")
        tb.set_attribute(".run", True)


def main():
    # Create VUnit instance from command line arguments
    vu = vunit.VUnit.from_argv()
    Library(vu).setup()
    # Run VUnit
    vu.main()


if __name__ == "__main__":
    # Runs when this file is executed, not when it is imported.
    main()

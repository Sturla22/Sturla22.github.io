#!/usr/bin/env python3
"""!
@file: run.py
"""
import pathlib

import vunit


class Library:
    def __init__(self, sources=[], test=False):
        """
        Create the VUnit library.
        """
        # Note that the library name 'work' is not allowed.
        self.sources = sources
        self.test = test
        self.compile_options = {}
        self.sim_options = {}
        self.name = self.__class__.__name__

    def setup(self, vu, name=None):
        """
        Add sources and configure library.
        """
        if name is not None:
            self.name = name

        self.lib = vu.add_library(self.name)
        self.pre_setup()
        self.add_sources()
        self.configure_compile()
        if self.test:
            self.configure_run()

    def pre_setup(self):
        pass

    def add_sources(self):
        """
        Point VUnit to the source files.
        """
        for s in self.sources:
            self.lib.add_source_file(s)

    def configure_compile(self):
        """
        Configure how VUnit builds the design and tests.
        """
        for key, val in self.compile_options.items():
            self.lib.add_compile_option(key, val)

    def configure_run(self):
        """
        Configure how VUnit runs the tests.
        """
        for key, val in self.sim_options.items():
            self.lib.set_sim_option(key, val)


class InternalLibrary(Library):
    def __init__(self, lib_root, src_paths, *args, **kwargs):
        for p in src_paths:
            sources = (lib_root.expanduser() / p).glob("*.vhd")
        super().__init__(sources, *args, **kwargs)


class PlTbUtils(InternalLibrary):
    def __init__(self, lib_root, *args, **kwargs):
        super().__init__(lib_root=lib_root, src_paths=["src/vhdl"], *args, **kwargs)


class Dut(Library):
    def __init__(self, sources=[], *args, **kwargs):
        super().__init__(sources, test=True, *args, **kwargs)


def main():
    # Create VUnit instance from command line arguments
    vu = vunit.VUnit.from_argv()

    pltbutils_root = pathlib.Path("~/Dev/hdl/pltbutils_github/")
    PlTbUtils(lib_root=pltbutils_root).setup(vu)

    dut_sources = ["half_adder.vhd", "half_adder_pltb_tb.vhd"]
    Dut(dut_sources).setup(vu)

    # Run VUnit
    vu.main()


if __name__ == "__main__":
    # Runs when this file is executed, not when it is imported.
    main()

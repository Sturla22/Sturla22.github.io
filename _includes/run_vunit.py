#!/bin/env python
"""
file: run_vunit.py
from: https://vunit.github.io/user_guide.html#introduction
"""

from vunit import VUnit

# Create VUnit instance by parsing command line arguments
vu = VUnit.from_argv()

# Create library 'lib'
lib = vu.add_library("lib")

lib.add_source_file("half_adder.vhd")
lib.add_source_file("half_adder_vunit_tb.vhd")

# Run vunit function
vu.main()

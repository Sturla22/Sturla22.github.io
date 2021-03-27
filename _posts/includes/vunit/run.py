#!/bin/env python
"""!
@file run.py
Based on https://vunit.github.io/user_guide.html#introduction
"""

from vunit import VUnit

# Create VUnit instance by parsing command line arguments
vu = VUnit.from_argv()

# Create library 'lib'
lib = vu.add_library("lib")

# Add basic.vhd from the current working directory to library
lib.add_source_file("basic.vhd")

# Run vunit function
vu.main()

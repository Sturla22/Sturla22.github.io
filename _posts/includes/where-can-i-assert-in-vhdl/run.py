#!/usr/bin/env python3
from vunit import VUnit

vu = VUnit.from_argv()
lib = vu.add_library("lib")
lib.add_source_file("assert_tb.vhd")
vu.main()

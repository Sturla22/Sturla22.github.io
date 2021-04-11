#!/usr/bin/env python3
from vunit import VUnit

vu = VUnit.from_argv()
vu.add_osvvm()
lib = vu.add_library("lib")
lib.add_source_files("*.vhd")
vu.main()

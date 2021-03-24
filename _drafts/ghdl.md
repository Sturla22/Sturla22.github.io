---
layout: post
title: GHDL
tags:
    - VHDL
    - Tools
---


Docs are on [readthedocs](https://ghdl.readthedocs.io/en/latest/about.html).

Installing on Ubuntu:

```bash
sudo apt install ghdl
```

Installing on Windows:
  1. Go to the [overview of pre-built packages](https://ghdl.readthedocs.io/en/latest/getting/Releases.html#downloading-pre-built-packages) and download the zip for Windows
  2. Extract the files in the zip
  3. Place the bin folder in your PATH
  4. Open cmd, powershell, or msys/git bash and run `ghdl -v` to check that your installation was successful

## Building and running testbenches

For a simple, one file design and a single testbench the following script will build and run the simulation:

```bash
#!/bin/env bash
# file: build.sh

if [[ $# -lt 1 || $# -gt 1 ]]; then
  echo "Usage: build.sh design_name"
  exit 1
fi

design=$*
testbench=${design}_tb

set -ex

ghdl -i $design.vhd $testbench.vhd
ghdl -m $testbench
ghdl -r $testbench
```

Remember to set executable permissions `chmod +x build.sh` and then run the script with for example:

`./build.sh half_adder`

Due to the `set -ex` statement, the output of the script is:
```
+ ghdl -i half_adder.vhd half_adder_tb.vhd
+ ghdl -m half_adder_tb
+ ghdl -r half_adder_tb
```

## Building libraries

```bash
{% include buildlib.sh %}
```

Remember to set executable permissions `chmod +x buildlib.sh` and then to build [PlTbUtils](https://opencores.org/projects/pltbutils) for example, run:

`./buildlib.sh pltbutils ~/Dev/hdl/pltbutils/trunk/src/vhdl/*.vhd`

## Using libraries with testbenches

```bash
{% include build.sh %}
```

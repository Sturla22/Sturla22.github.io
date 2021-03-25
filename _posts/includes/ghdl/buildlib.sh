#!/bin/env bash
# file: buildlib.sh

workdir="_work"

if [[ $# -lt 2 ]]; then
  echo "Usage: build.sh [-o _work] lib_name lib_sources"
  exit 1
else
  while [[ "$#" -gt 0 ]]; do
    case $1 in
      -o) workdir="$2"; shift;;
      *) lib_name="$1" && shift 1 && lib_src="$@" && break;;
    esac
    shift
  done
fi

# Make sure workdir exists
mkdir -p $workdir

set -ex

ghdl -i --workdir=$workdir -P$workdir --work=$lib_name $lib_src

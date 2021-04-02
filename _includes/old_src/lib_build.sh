# file: lib_build.sh

options="$options --workdir=_work -P_work --work=$lib_name"
$ghdl -i $options $lib_src

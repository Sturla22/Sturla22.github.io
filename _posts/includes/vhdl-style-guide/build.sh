set -ex

vsg -f half_adder_original.vhd | tee half_adder_original.txt
cp half_adder_original.vhd half_adder_fixed.vhd
vsg --fix -f half_adder_fixed.vhd | tee half_adder_fixed.txt
cp half_adder_fixed.vhd half_adder_config.vhd
vsg --fix -c config.json -f half_adder_config.vhd | tee half_adder_config.txt

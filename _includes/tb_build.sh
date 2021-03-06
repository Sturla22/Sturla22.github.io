options="$options --workdir=$workdir -P$workdir"
if [[ "$vcd" == 'yes' ]]
then
  vcd="--vcd=$test_bench.vcd"
else
  vcd=""
fi

mkdir -p $workdir


$ghdl -i $options half_adder.vhd $test_bench.vhd
$ghdl -m $options $test_bench

$ghdl -r $options $test_bench $vcd | tee ${test_bench}.txt

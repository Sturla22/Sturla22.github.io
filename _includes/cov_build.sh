# file: cov_build.sh

options="$options --workdir=$workdir -P$workdir"

if [[ "$vcd" == "yes" ]]
then
  vcd="--vcd=$test_bench.vcd"
else
  vcd=""
fi

mkdir -p $workdir

$ghdl -a $options -g -fprofile-arcs -ftest-coverage half_adder.vhd $test_bench.vhd

$ghdl -e $options -Wl,-lgcov -Wl,--coverage $test_bench

$ghdl -r $options $test_bench $vcd | tee ${test_bench}_cov_results.txt

gcovr --gcov-executable gcov-9 | tee ${test_bench}_coverage.txt

rm -f *.o *.gcno *.gcda $test_bench

#!/bin/bash
OUTPUT_DIR="AchvSystemJS/coverage"
mkdir $OUTPUT_DIR

GENHTML=`which genhtml`
if [ "$?" -eq 1 ];
then
    echo "genhtml not found."
    exit 1
fi

cd $OUTPUT_DIR
$GENHTML ../test-reports/jsTestDriver.conf-coverage.dat
echo "Done."

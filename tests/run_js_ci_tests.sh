#!/bin/bash
#
# QBadge - Questor Achievement System
#
# Copyright (c) 2013 Questor GmbH
#
# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

OUTPUT_DIR="qbadge/test-reports"
mkdir $OUTPUT_DIR

XVFB=`which Xvfb`
if [ "$?" -eq 1 ];
then
    echo "Xvfb not found."
    exit 1
fi

FIREFOX=`which firefox`
if [ "$?" -eq 1 ];
then
    echo "Firefox not found."
    exit 1
fi

$XVFB :99 -ac &    # launch virtual framebuffer into the background
PID_XVFB="$!"      # take the process ID
export DISPLAY=:99 # set display to use that of the xvfb

# run the tests
java -jar JsTestDriver/JsTestDriver-1.3.4.b.jar --config tests/unittests/jsTestDriver.conf --port 9876 --browser $FIREFOX --tests all --testOutput $OUTPUT_DIR

kill $PID_XVFB     # shut down xvfb (firefox will shut down cleanly by JsTestDriver)
echo "Done."

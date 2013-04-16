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

usage() {
	echo "usage: $0 DB DESIGN_NAME DESIGN_JSON_FILE"
}
DB=$1
DESIGN_NAME=$2
DESIGN_JSON=$3

if [ $# -eq 4 ] ; then
	usage
	exit 1
fi

RESPONSE=$(curl -s -X PUT http://127.0.0.1:5984/$DB/_design/$DESIGN_NAME --data-binary @$DESIGN_JSON)
echo "curl response: $RESPONSE"

UPDATE_CONFLICT='Document update conflict'
if [[ "$RESPONSE" == *"$UPDATE_CONFLICT"* ]]
then
  echo "Remove existing document and re-upload.";
fi



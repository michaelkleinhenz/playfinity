#!/bin/bash

usage() {
	echo "usage: $0 DESIGN_NAME DESIGN_JSON_FILE"
}
DESIGN_NAME=$1
DESIGN_JSON=$2

if [ $# -eq 3 ] ; then
	usage
	exit 1
fi

RESPONSE=$(curl -X PUT http://127.0.0.1:5984/achievement/_design/$DESIGN_NAME --data-binary @$DESIGN_JSON)
echo "curl response: $RESPONSE"

UPDATE_CONFLICT='Document update conflict'
if [[ "$RESPONSE" == *"$UPDATE_CONFLICT"* ]]
then
  echo "Remove existing document and re-upload.";
fi



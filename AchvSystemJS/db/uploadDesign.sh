#!/bin/bash

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

RESPONSE=$(curl -X PUT http://127.0.0.1:5984/$DB/_design/$DESIGN_NAME --data-binary @$DESIGN_JSON)
echo "curl response: $RESPONSE"

UPDATE_CONFLICT='Document update conflict'
if [[ "$RESPONSE" == *"$UPDATE_CONFLICT"* ]]
then
  echo "Remove existing document and re-upload.";
fi



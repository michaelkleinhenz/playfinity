#!/bin/sh
ACHIEVEMENT_JSON=$1
curl --upload-file $ACHIEVEMENT_JSON -H "Content-Type: application/json" -X PUT http://localhost:8080/store


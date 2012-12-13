#!/bin/sh
EVENT_JSON=$1
curl --upload-file $EVENT_JSON -H "Content-Type: application/json" -X PUT http://localhost:8383/achv/event


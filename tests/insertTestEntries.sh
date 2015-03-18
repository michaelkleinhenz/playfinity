#!/bin/bash

curl -H 'Content-Type: application/json' -d @$1 -X POST http://localhost:5984/leaderboard/_bulk_docs

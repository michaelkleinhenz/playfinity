# QBADGE Achievement and Badge System

Copyright (c) 2013 Questor GmbH, Berlin

QBadge is a universal achievement and badge system based on a flexible state engine. QBadge uses a technology based on process definitions and elements from common Business Process Management Systems (BPMS) to provide an easy, yet flexible approach to achievements.

QBadge can be used as a cloud-hosted service, a self-hosted service on your own servers or as an embedded library on all platforms that support JavaScript as a scripting language. Common targets include Windows, Linux, Mac, iOS, Android, and even web browsers.

See additional documentation at:

    https://bitbucket.org/questor-ondemand/qbadge/wiki/Home

# Simple Usage Example

This assumes that you have a couchDB installed at localhost and some kind of POSIX compliant operating
system capable of executing bash scripts. You also need curl installed to call REST endpoints.

## Create databases

    http://localhost:5984/_utils/index.html

Create the following databases:

    achievement
    achievement_instance

## Upload designs to databases

    cd db
    ./uploadDesign.sh achievement achievement designs/achievement_design.json
    ./uploadDesign.sh achievement_instance achievement_instance designs/achievement_instance_design.json

## Install npm

    npm install

## Start node

    node src/main.js

## Create achievement models

    curl --upload-file doc/examples/example-achievement-oneshot.json -H "Content-Type: application/json" -X PUT http://localhost:8080/store/model
    curl --upload-file doc/examples/example-achievement-counter.json -H "Content-Type: application/json" -X PUT http://localhost:8080/store/model
    curl --upload-file doc/examples/example-achievement-stopwatch.json -H "Content-Type: application/json" -X PUT http://localhost:8080/store/model

## Read achievement models

    http://localhost:8080/store/model/developer/mygame

## Init the achievement instances

    curl -s -X POST http://localhost:8080/store/model/developer/mygame/gamername

## Read the achievement instances

    http://localhost:8080/store/instance/mygame/gamername

## Trigger events

    curl -s -X GET http://localhost:8080/event/mygame/gamername/MyOneShotAchievementEvent
    curl -s -X GET http://localhost:8080/event/mygame/gamername/MyCounterAchievementEvent
    curl -s -X GET http://localhost:8080/event/mygame/gamername/MyCounterAchievementEvent
    curl -s -X GET http://localhost:8080/event/mygame/gamername/MyCounterAchievementEvent
    curl -s -X GET http://localhost:8080/event/mygame/gamername/MyCounterAchievementEvent
    curl -s -X GET http://localhost:8080/event/mygame/gamername/MyCounterAchievementEvent
    curl -s -X GET http://localhost:8080/event/mygame/gamername/StartMyStopWatchAchievementEvent

## Read the unlocked achievements

    http://localhost:8080/store/unlocked/mygame/gamername

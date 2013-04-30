# QBADGE Achievement and Badge System

Copyright (c) 2013 Questor GmbH, Berlin

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

    cd tests/integrationtests/server
    ./PUT_Achievement.sh ../../unittests/fixture/achievement/Model_MyOneShotAchievement.json
    ./PUT_Achievement.sh ../../unittests/fixture/achievement/Model_MyCounterAchievement.json
    ./PUT_Achievement.sh ../../unittests/fixture/achievement/Model_MyOneShotAchievement.json

## Read achievement models

    http://localhost:8080/store/model/admin/My_Hunt

## Init the achievement instances

    curl -s -X POST http://localhost:8080/store/model/admin/My_Hunt/tim

## Read the achievement instances

    http://localhost:8080/store/instance/My_Hunt/tim

## Trigger events

    curl -s -X GET http://localhost:8080/event/My_Hunt/tim/MyOneShotAchievementEvent
    curl -s -X GET http://localhost:8080/event/My_Hunt/tim/MyCounterAchievementEvent
    curl -s -X GET http://localhost:8080/event/My_Hunt/tim/MyCounterAchievementEvent
    curl -s -X GET http://localhost:8080/event/My_Hunt/tim/MyCounterAchievementEvent
    curl -s -X GET http://localhost:8080/event/My_Hunt/tim/MyCounterAchievementEvent
    curl -s -X GET http://localhost:8080/event/My_Hunt/tim/MyCounterAchievementEvent
    curl -s -X GET http://localhost:8080/event/My_Hunt/tim/StartMyStopWatchAchievementEvent

## Read the achievement instances

    http://localhost:8080/store/unlocked/My_Hunt/tim

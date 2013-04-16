# QBADGE Achievement and Badge System

Copyright (c) 2013 Questor GmbH, Berlin

See additional documentation at:

    https://admin.goquestor.com/wiki/index.php/Achievement_System
    https://admin.goquestor.com/wiki/index.php/Achievement_Integration
    https://admin.goquestor.com/wiki/index.php/Achievement_Service

# Simple Usage Example

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

    curl -s -X POST http://localhost:8080/store/model/init/admin/My_Hunt/tim

## Read the achievement instances

    http://localhost:8080/store/instance/My_Hunt/tim

## Trigger events

    cd integrationstests/server
    ./PUT_Event.sh ../../unittests/fixture/event/MyOneShotAchievementEvent.json
    ./PUT_Event.sh ../../unittests/fixture/event/MyCounterAchievementEvent.json
    ./PUT_Event.sh ../../unittests/fixture/event/MyCounterAchievementEvent.json
    ./PUT_Event.sh ../../unittests/fixture/event/MyCounterAchievementEvent.json
    ./PUT_Event.sh ../../unittests/fixture/event/MyCounterAchievementEvent.json
    ./PUT_Event.sh ../../unittests/fixture/event/MyCounterAchievementEvent.json
    ./PUT_Event.sh ../../unittests/fixture/event/StartMyStopWatchAchievementEvent.json

## Read the achievement instances

    http://localhost:8080/store/cabinet/My_Hunt/tim

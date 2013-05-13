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

    user
    game
    achievement
    achievement_instance

## Upload designs to databases

    cd db
    ./uploadDesign.sh user user designs/user_design.json
    ./uploadDesign.sh game game designs/game_design.json
    ./uploadDesign.sh achievement achievement designs/achievement_design.json
    ./uploadDesign.sh achievement_instance achievement_instance designs/achievement_instance_design.json

## Install npm

    npm install

## Start node

    node src/main.js

Note the example auth token reported on the console:

    info: QBadge Achievement System
    info: Copyright (c) 2013 Questor GmbH, Berlin
    info: Service listening at port 8080
    debug: Example game created.
    debug: Example user created.
    debug: Running in debug mode. Use the following auth token for demo queries:
    debug: 6c9507072946a6b06efd52566d005267923ec32036186de1e0364017b8dd6791%user%game%1368362322639%1234567890

The token has to be added to all subsequent calls as the "auth" parameter.

***Important*** The last substring (after the last "%") in the token string is the nonce which prevents replay
attacks. It has to be unique for each call. In the above case, the nonce is "1234567890". Just use a random nonce
for each call below. Every unique nonce can only be used once in 5 minutes. The token in general is only valid for
5 minutes, which is checked by the encoded epoch time. So make sure you run the below demos in 5 minutes after
starting the service.

## Create achievement models

    curl --upload-file doc/examples/example-achievement-oneshot.json -H "Content-Type: application/json" -X PUT http://localhost:8080/store/model?auth=<authToken>
    curl --upload-file doc/examples/example-achievement-counter.json -H "Content-Type: application/json" -X PUT http://localhost:8080/store/model?auth=<authToken>
    curl --upload-file doc/examples/example-achievement-stopwatch.json -H "Content-Type: application/json" -X PUT http://localhost:8080/store/model?auth=<authToken>

## Read achievement models

    http://localhost:8080/store/model/developer/mygame?auth=<authToken>

## Init the achievement instances

    curl -s -X POST http://localhost:8080/store/model/developer/mygame/gamername?auth=<authToken>

## Read the achievement instances

    http://localhost:8080/store/instance/mygame/gamername?auth=<authToken>

## Trigger events

    curl -s -X GET http://localhost:8080/event/mygame/gamername/MyOneShotAchievementEvent?auth=<authToken>
    curl -s -X GET http://localhost:8080/event/mygame/gamername/MyCounterAchievementEvent?auth=<authToken>
    curl -s -X GET http://localhost:8080/event/mygame/gamername/MyCounterAchievementEvent?auth=<authToken>
    curl -s -X GET http://localhost:8080/event/mygame/gamername/MyCounterAchievementEvent?auth=<authToken>
    curl -s -X GET http://localhost:8080/event/mygame/gamername/MyCounterAchievementEvent?auth=<authToken>
    curl -s -X GET http://localhost:8080/event/mygame/gamername/MyCounterAchievementEvent?auth=<authToken>
    curl -s -X GET http://localhost:8080/event/mygame/gamername/StartMyStopWatchAchievementEvent?auth=<authToken>

## Read the unlocked achievements

    http://localhost:8080/store/unlocked/mygame/gamername?auth=<authToken>

# Playfinity Scalable Middleware for Game and Gamification Projects

Copyright (c) 2013 Questor GmbH, Berlin

Playfinity is a scalable service middleware which provides an achievement and badge system based on a flexible state engine, a leaderboard service, a savegame synchronization service, and a game logic hosting service. Playfinity uses a technology based on process definitions and elements from common Business Process Management Systems (BPMS) to provide an easy, yet flexible approach to achievements.

Playfinity can be used as a cloud-hosted service, a self-hosted service on your own servers or as an embedded library on all platforms that support JavaScript as a scripting language. Common targets include Windows, Linux, Mac, iOS, Android, and even web browsers.

See additional documentation at:

    https://bitbucket.org/questor-ondemand/playfinity/wiki/Home

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

    info: Playfinity System
    info: Copyright (c) 2013 Questor GmbH, Berlin
    info: Service listening at port 8080
    debug: Example game created.
    debug: Example user created.
    debug: Running in debug mode. Use the following auth token dispenser to get tokens for demo queries:
    debug: http://localhost:8080/token

An authentication token has to be added to all subsequent calls as the "auth" parameter.

The authentication token has to be calculated from the request parameters for each subsequent call.
To make things easier for testing out the service, a REST call for creating tokens is provided ***only in debug
mode*** at the given address (in this case "http://localhost:8080/token").

***Important***: In the default configuration, the authentication is disabled entirely. You'll need no auth tokens for
the calls below. In production mode, each call has to carry a parameter "auth" which contains the token.

## Create achievement models

    curl --upload-file doc/example-achievements/example-achievement-oneshot.json -H "Content-Type: application/json" -X PUT http://localhost:8080/store/model
    curl --upload-file doc/example-achievements/example-achievement-counter.json -H "Content-Type: application/json" -X PUT http://localhost:8080/store/model
    curl --upload-file doc/example-achievements/example-achievement-stopwatch.json -H "Content-Type: application/json" -X PUT http://localhost:8080/store/model

## Read achievement models

    http://localhost:8080/store/model/developer/mygame

## Init the achievement instances

    curl -s -X GET http://localhost:8080/store/model/developer/mygame/developer

In this case, the user is the same as the developer ("developer").

## Read the achievement instances

    http://localhost:8080/store/instance/mygame/developer

## Trigger events

    curl -s -X GET http://localhost:8080/event/mygame/developer/MyOneShotAchievementEvent
    curl -s -X GET http://localhost:8080/event/mygame/developer/MyCounterAchievementEvent
    curl -s -X GET http://localhost:8080/event/mygame/developer/MyCounterAchievementEvent
    curl -s -X GET http://localhost:8080/event/mygame/developer/MyCounterAchievementEvent
    curl -s -X GET http://localhost:8080/event/mygame/developer/MyCounterAchievementEvent
    curl -s -X GET http://localhost:8080/event/mygame/developer/MyCounterAchievementEvent
    curl -s -X GET http://localhost:8080/event/mygame/developer/StartMyStopWatchAchievementEvent

## Read the unlocked achievements

    http://localhost:8080/store/unlocked/mygame/developer



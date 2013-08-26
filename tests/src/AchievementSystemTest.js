/*
 * Playfinity
 * Questor Achievement System
 *
 * Copyright (c) 2013 Questor GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// load libraries
var EventEmitter = require('../../src/util/EventEmitter-4.0.2.min.js').EventEmitter;

global.Async = require('async');

global.JsHamcrest = require('../libs/jshamcrest-0.6.8.js').JsHamcrest;
JsHamcrest.Integration.Nodeunit();

global.JsMockito = require('../libs/jsmockito-1.0.4.js').JsMockito;
JsMockito.Integration.Nodeunit();

// load achievement system class
global.ACHV = require("../../src/achievements/ACHV.js");
require('require-dir')('../../src/achievements/engine');
require('../../src/achievements/AchievementProcessor');
require('../../src/achievements/AchievementEngine');
require('../../src/achievements/AchievementSystem');
var store = require('../../src/store/AchievementStore');
var instanceStore = require('../../src/store/AchievementInstanceStore');

// load fixtures
require('../fixtures/AchievementFixtures.js');

module.exports = {

    setUp: function (callback) {
        this.eventBus = new EventEmitter();
        var achvInstanceStoreMock = this.achvInstanceStoreMock = mock(instanceStore.achievementInstanceStore({}));
        var achvStoreMock = mock(store.achievementStore({}));

        // AchievementInstanceStore getAchievementsForGameIdAndUserId
        // Valid
        when(achvInstanceStoreMock).getAchievementsForGameIdAndUserId(not(3), anything()).
            then(function(gameId, user, callback) {
                var startGameAchievement = FIXTURE.getStartGameAchievement(),
                    startGameAchievementDoc = {
                        "value" : startGameAchievement
                    };
                startGameAchievement.gameId = 1;
                startGameAchievement.userId = 2;
                var a2AAchievement = FIXTURE.get2AAchievement();
                a2AAchievement.gameId = 1;
                a2AAchievement.userId = 2;
                var a2AAchievementDoc = {
                    "value": a2AAchievement
                };
                var achievementDocs = [startGameAchievementDoc, a2AAchievementDoc];
                var body = {
                    rows: {}
                };
                body.rows.length = achievementDocs.length;
                body.rows.forEach = function (forEachCallBack) {
                    var i = 0;
                    for (i; i < achievementDocs.length; i++) {
                        forEachCallBack(achievementDocs[i]);
                    }
                };
                callback(null, body, {});
            });
        // Error
        when(achvInstanceStoreMock).getAchievementsForGameIdAndUserId(equalTo(3), anything()).
            then(function (gameId, userId, callback) {
                callback("Error reading achievements.", null, null);
            });

        // AchievementInstanceStore createOrUpdateAchievementInstance
        var errorAchievementInstance = {"name":"PlayForTenSecondsAchievement","process":[[{"type":"StopWatchRule","events":[{"name":"StartGameEvent"},{"name":"StopGameEvent"}],"state":"inProgress","startEvent":"StartGameEvent","stopEvent":"StopGameEvent","timer":0,"TIMER_MAX_SEC":10}]],"locked":true,"frequencyCounter":0,"FREQUENCY_COUNTER_MAX":1,"gameId":2,"userId":2};

        when(achvInstanceStoreMock).createOrUpdateAchievementInstance(not(errorAchievementInstance)).
            then(function (doc, callback) {
                callback(null, "body");
            });

        when(achvInstanceStoreMock).createOrUpdateAchievementInstance(hasMember("name", equalTo("PlayForTenSecondsAchievement"))).
            then(function (doc, callback) {
                callback("Unit Test Expected Error", null);
            });

        // AchievementStore callback with no achievement, gameId=0.
        when(achvStoreMock).getAchievementsForGameId(equalTo(0)).
            then(function (gameId, callback) {
                var body = {
                    rows: {}
                };
                body.rows.length = 0;
                callback(null, body, {});
            });

        // AchievementStore callback with one achievement, gameId=1.
        when(achvStoreMock).getAchievementsForGameId(equalTo(1)).
            then(function (gameId, callback) {
                var a2AAchievement = FIXTURE.get2AAchievement(),
                    doc = {
                        value: a2AAchievement
                    },
                    body = {
                        rows: {}
                    };
                body.rows.length = 1;
                a2AAchievement.gameId = 1;
                body.rows.forEach = function (forEachCallBack) {
                    forEachCallBack(doc);
                };
                callback(null, body, {});
            });

        // AchievementStore callback with two achievements, gameId=2.
        when(achvStoreMock).getAchievementsForGameId(equalTo(2)).
            then(function (gameId, callback) {
                var a2AAchievement = FIXTURE.get2AAchievement(),
                    docOne = {
                        value: a2AAchievement
                    },
                    playForTenSecondsAchievement = FIXTURE.getPlayFor10000msAchievement(),
                    docTwo = {
                        value: playForTenSecondsAchievement
                    },
                    body = {
                        rows: {}
                    };
                a2AAchievement.gameId = 2;
                playForTenSecondsAchievement.gameId = 2;
                body.rows.length = 2;
                body.rows.forEach = function (forEachCallBack) {
                    forEachCallBack(docOne);
                    forEachCallBack(docTwo);
                };
                callback(null, body, {});
            });

        // AchievementStore callback with error, gameId=3.
        when(achvStoreMock).getAchievementsForGameId(equalTo(3)).
            then(function (gameId, callback) {
                callback("Some Error", null, null);
            });

        this.defaultAchvSys = new ACHV.AchievementSystem(achvInstanceStoreMock, this.eventBus);
        callback();
    },

    tearDown: function (callback) {
        // clean up
        callback();
    },

    "Registering a new game" : function (test) {
        this.defaultAchvSys.registerGame("MyGame");
        test.ok(this.defaultAchvSys.isRegistered("MyGame"));
        test.done();
    },

    "Unlocking an achievement": function (test) {
        var eventBus = new EventEmitter();
        var achvEngineConf = {
                "eventBus": eventBus
            };
        var achievementEngine = mock(new ACHV.AchievementEngine(achvEngineConf));
        when(achievementEngine).getAchievements().thenReturn([achievement]);
        var achievement = FIXTURE.getStartGameAchievement();

        var achievementSystem = new ACHV.AchievementSystem(mock(instanceStore.achievementInstanceStore({})), eventBus);
        achievementSystem.setAchievementEngines({ "1_2": achievementEngine});
        test.ok(!achievementSystem.isAchievementUnlocked(1, 2, achievement));
        test.done();
    },

    "Creating achievement engine for game and user": function (test) {
        var achvSystem = this.defaultAchvSys;
        var event = {
            "eventId": "",
            "gameId": "1",
            "userId": "2"
        };
        achvSystem.getAchievementEngineForGameAndUser(event.gameId, event.userId, function (achievementEngine) {
            test.ok(achievementEngine===undefined);
        });
        achvSystem.triggerEvent(event, function (achievements) {
            achvSystem.getAchievementEngineForGameAndUser(event.gameId, event.userId, function(achievementEngine) {
                test.ok(!(achievementEngine===undefined));
            });
        });
        test.done();
    },

    "Failed init achievement engine": function (test) {
        var event = {
            "eventId": "eventB",
            "gameId": "3",
            "userId": "2"
        };
        this.defaultAchvSys.triggerEvent(event, function(error, achievements) {
            test.ok(!(error===undefined));
            test.equal(achievements, null);
        });
        test.done();
    },

    "Registering an achievement": function (test) {
        var event = {
            "eventId": "eventB",
            "gameId": "3",
            "userId": "2"
        };
        this.defaultAchvSys.triggerEvent(event, function(achievements) {
            test.ok(!(achievements===null));
        });
        test.done();
    },

    "Failed achievement update": function (test) {
        var achievement = FIXTURE.getPlayFor10000msAchievement();
        this.eventBus.emitEvent('achv_value_changed', [achievement]);
        verify(this.achvInstanceStoreMock).createOrUpdateAchievementInstance(achievement, anything());
        test.done();
    }
};
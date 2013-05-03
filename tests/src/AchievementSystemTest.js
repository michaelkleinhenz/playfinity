/*
 * QBadge
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

var EventEmitter = require('../../src/util/EventEmitter-4.0.2.min.js').EventEmitter;
var requireDir = require('require-dir');
global.Async = require('async');

global.JsHamcrest = require('../libs/jshamcrest-0.6.8.js').JsHamcrest;
JsHamcrest.Integration.Nodeunit();

var JsMockito = require('../libs/jsmockito-1.0.4.js').JsMockito;
JsMockito.Integration.Nodeunit();

global.ACHV = require("../../src/core/ACHV.js");
requireDir('../../src/core/engine');
require('../../src/core/AchievementProcessor');
require('../../src/core/AchievementEngine');

var achvSystem = require('../../src/core/AchievementSystem');
var achvStore = require('../../src/store/AchievementStore');
var achvInstanceStore = require('../../src/store/AchievementInstanceStore');

require('../fixtures/AchievementFixtures.js');

module.exports = {

    setUp: function (callback) {
        this.eventBus = new EventEmitter();
        var achvInstanceStoreMock = this.achvInstanceStoreMock =  mock(ACHV.achievementInstanceStore({})),
            achvStoreMock = mock(ACHV.achievementStore({})),
            achvSysConf = {
                "achievementStore" : achvStoreMock,
                "achievementInstanceStore" : achvInstanceStoreMock,
                "achievementEngines": {},
                "eventBus": this.eventBus
            };

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
                var twoHeadShotsAchievement = FIXTURE.getTwoHeadShotsAchievement();
                twoHeadShotsAchievement.gameId = 1;
                twoHeadShotsAchievement.userId = 2;
                var twoHeadShotsAchievementDoc = {
                    "value": twoHeadShotsAchievement
                };
                var achievementDocs = [startGameAchievementDoc, twoHeadShotsAchievementDoc];
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
                callback("Some Error", null);
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
                var twoHeadShotsAchievement = FIXTURE.getTwoHeadShotsAchievement(),
                    doc = {
                        value: twoHeadShotsAchievement
                    },
                    body = {
                        rows: {}
                    };
                body.rows.length = 1;
                twoHeadShotsAchievement.gameId = 1;
                body.rows.forEach = function (forEachCallBack) {
                    forEachCallBack(doc);
                };
                callback(null, body, {});
            });

        // AchievementStore callback with two achievements, gameId=2.
        when(achvStoreMock).getAchievementsForGameId(equalTo(2)).
            then(function (gameId, callback) {
                var twoHeadShotsAchievement = FIXTURE.getTwoHeadShotsAchievement(),
                    docOne = {
                        value: twoHeadShotsAchievement
                    },
                    playForTenSecondsAchievement = FIXTURE.getPlayForTenSecondsAchievement(),
                    docTwo = {
                        value: playForTenSecondsAchievement
                    },
                    body = {
                        rows: {}
                    };
                twoHeadShotsAchievement.gameId = 2;
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

        this.defaultAchvSys = new ACHV.AchievementSystem(achvSysConf);
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

    testIsAchivementUnlocked: function (test) {
        var eventBus = new EventEmitter();
        var achvEngineConf = {
                "eventBus": eventBus
            };
        var achievementEngine = mock(new ACHV.AchievementEngine(achvEngineConf));
        when(achievementEngine).getAchievements().thenReturn([achievement]);

        var achievement = FIXTURE.getStartGameAchievement();

        var achvSystemConf = {
                achievementStore: mock(ACHV.achievementStore({})),
                achievementInstanceStore: mock(ACHV.achievementInstanceStore({})),
                achievementEngines: { "1_2": achievementEngine},
                eventBus: eventBus
            };
        var achievementSystem = new ACHV.AchievementSystem(achvSystemConf);

        test.ok(!achievementSystem.isAchievementUnlocked(1, 2, achievement));
        test.done();
    },

    testCreatingAchievementEngineForGameAndUser: function (test) {
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
    }

    /*

    testInitAchievementsOneAchievement: function (test) {
        var id = {
            "gameId": 1,
            "userId": 2
        };
        this.defaultAchvSys.
        this.defaultAchvSys.initAchievements(id, initAchievementCallback);

        function initAchievementCallback(error, result) {
            ok(error==undefined);
            ok("Achievement instances created.", result);
        }
        test.done();
    },

    testInitAchievementsTwoAchievements: function () {
        "use strict";
        var id = {
            "gameId": 2,
            "userId": 2
        };
        this.defaultAchvSys.initAchievements(id, initAchievementsCallback);

        function initAchievementsCallback(error, result) {
            assertNull(error);
            assertEquals("Achievement instances created.", result);
        }
    },

    testInitAchievementsError: function () {
        "use strict";
        var id = {
            "gameId": 3,
            "userId": 2
        };
        this.defaultAchvSys.initAchievements(id, initAchievementsCallback);

        function initAchievementsCallback(error, result) {
            assertNotNull(error);
            assertNull(result);
        }
    },

    testInitAchievementsNoAchievements: function () {
        "use strict";
        var id = {
            "gameId": 0,
            "userId": 2
        };
        this.defaultAchvSys.initAchievements(id, initAchievementsCallback);

        function initAchievementsCallback(error, result) {
            assertNull(error);
            assertEquals("Achievement instances created.", result);
        }
    },

    testInitAchievementEngineError: function () {
        "use strict";
        var event = FIXTURE.getChestShotEvent();
        event.gameId = 3;
        event.userId = 2;
        this.defaultAchvSys.triggerEvent(event, initAchievementEngineCallback);

        function initAchievementEngineCallback(error, achievements) {
            assertNotNull(error);
            assertNull(achievements);
        }
    },

    testRegisterAchievement: function () {
        "use strict";
        var event = FIXTURE.getChestShotEvent();
        event.gameId = 1;
        event.userId = 2;
        this.defaultAchvSys.triggerEvent(event, registerAchievementCallback);

        function registerAchievementCallback(achievements) {
            assertNotNull(achievements);
        }
    },

    testUpdateAchievementError: function () {
        "use strict";
        var achievement = FIXTURE.getPlayForTenSecondsAchievement();
        this.eventBus.emitEvent('achv_value_changed', [achievement]);
        verify(this.achvInstanceStoreMock).createOrUpdateAchievementInstance(achievement, anything());
    }
    */
};
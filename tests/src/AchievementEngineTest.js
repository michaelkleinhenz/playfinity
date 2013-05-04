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

// load libraries
var EventEmitter = require('../../src/util/EventEmitter-4.0.2.min.js').EventEmitter;

global.Async = require('async');

global.JsHamcrest = require('../libs/jshamcrest-0.6.8.js').JsHamcrest;
JsHamcrest.Integration.Nodeunit();

global.JsMockito = require('../libs/jsmockito-1.0.4.js').JsMockito;
JsMockito.Integration.Nodeunit();

// load achievement system class
global.ACHV = require("../../src/core/ACHV.js");
require('require-dir')('../../src/core/engine');
require('../../src/core/AchievementProcessor');
require('../../src/core/AchievementEngine');
require('../../src/core/AchievementWrapper');
require('../../src/core/AchievementSystem');
require('../../src/store/AchievementStore');
require('../../src/store/AchievementInstanceStore');

global.Utils = require('../../src/util/utils');

// load fixtures
require('../fixtures/AchievementFixtures.js');

module.exports = {

    setUp: function (callback) {
        // setup achievement engine
        var eventBus = new EventEmitter();
        var achvEngineConf = {
            "eventBus": eventBus
        };
        achievementEngine = new ACHV.AchievementEngine(achvEngineConf);
        var counterEnginge = ACHV.counterEngine({"achievementType": "CounterRule"});
        achievementEngine.registerEngine(counterEnginge);
        var timerEngine = ACHV.timerEngine({"achievementType": "TimerRule"});
        achievementEngine.registerEngine(timerEngine);
        var oneShotEngine = ACHV.oneShotEngine({"achievementType": "OneShotRule"});
        achievementEngine.registerEngine(oneShotEngine);
        var stopWatchEngine = ACHV.stopWatchEngine({"achievementType": "StopWatchRule"});
        achievementEngine.registerEngine(stopWatchEngine);
        callback();
    },

    testRegisterEngine: function (test) {
        var engine = ACHV.counterEngine({"achievementType": "CounterRule"});
        achievementEngine.registerEngine(engine);
        var resultAchievementEngine = achievementEngine.getEngineForAchievementType(engine.achievementType);
        test.equals(engine, resultAchievementEngine);
        test.done();
    },

    testRegisterAchievement: function (test) {
        var achievement = FIXTURE.getStartGameAchievement();
        var achievements = achievementEngine.getAchievements();
        test.equals(Utils.arrayContains(achievements, achievement), false);
        achievementEngine.registerAchievement(achievement);
        achievements = achievementEngine.getAchievements();
        test.ok(Utils.arrayContains(achievements, achievement));
        test.done();
    },

    testRegisterAchievementTwo: function (test) {
        var achievement = FIXTURE.getTenHeadShotsInTenMinutesAchievement();
        achievementEngine.registerAchievement(achievement);
        var achievements = achievementEngine.getAchievementsForEventType("HeadShotEvent");
        test.equals(1, achievements.length);
        test.done();
    },

    testGetAchievement: function (test) {
        var achievement = FIXTURE.getStartGameAchievement();
        achievementEngine.registerAchievement(achievement);
        var resultAchievement = achievementEngine.getAchievement(achievement.name);
        test.equals(achievement, resultAchievement);
        test.done();
    },

    testRegisterAdditionallyAchievementForEvent: function (test) {
        var startGameAchievement = FIXTURE.getStartGameAchievement();
        achievementEngine.registerAchievement(startGameAchievement);
        var firstStartAchievement = FIXTURE.getFirstStartAchievement();
        achievementEngine.registerAchievement(firstStartAchievement);
        var resultAchievements = achievementEngine.getAchievementsForEventType("StartGameEvent");
        var expectedAchievements = [startGameAchievement, firstStartAchievement];
        test.deepEqual(expectedAchievements, resultAchievements);
        test.done();
    },

    testGetAchievements: function (test) {
        var startGameAchievement = FIXTURE.getStartGameAchievement();
        var headShotAchievement = FIXTURE.getTenHeadShotsAchievement();
        achievementEngine.registerAchievement(startGameAchievement);
        achievementEngine.registerAchievement(headShotAchievement);
        var achievements = achievementEngine.getAchievements();
        test.ok(Utils.arrayContains(achievements, startGameAchievement));
        test.ok(Utils.arrayContains(achievements, headShotAchievement));
        test.done();
    },

    testProcessOneShotEvent: function (test) {
        var achievement = FIXTURE.getStartGameAchievement();
        achievementEngine.registerAchievement(achievement);
        var event = {
            "eventId": "StartGameEvent",
            "gameId": "1",
            "userId": "2"
        };
        achievementEngine.processEvent(event, function notifyUnlock(achievements) {
            var index = achievements.indexOf(achievement);
            var resultAchievement = achievements[index];
            test.equals(resultAchievement.locked, false);
        });
        test.done();
    },

    testAchievementTypeOnce: function (test) {
        var onceAchievement = FIXTURE.getFirstStartAchievement();
        achievementEngine.registerAchievement(onceAchievement);
        var achievements = achievementEngine.getAchievements();
        test.ok(Utils.arrayContains(achievements, onceAchievement));

        var event = {
            "eventId": "StartGameEvent",
            "gameId": "1",
            "userId": "2"
        };
        achievementEngine.processEvent(event, function (unlockedAchievements) {
            test.ok(Utils.arrayContains(unlockedAchievements, onceAchievement));
        });
        achievements = achievementEngine.getAchievements();
        test.equals(Utils.arrayContains(achievements, onceAchievement), false);
        test.done();
    },

    testRemoveOnceAchievementForTwoEvents: function (test) {
        // set achievement
        var achievement = FIXTURE.getTenHeadAndKneeShotsAchievement();
        achievementEngine.registerAchievement(achievement);

        // check achievement registered
        var achievements = achievementEngine.getAchievements();
        test.ok(Utils.arrayContains(achievements, achievement));

        // trigger unlock event
        var kneeShotEvent = {
            "tsInit": new Date().getTime(),
            "eventId": "KneeShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        var headShotEvent = {
            "tsInit": new Date().getTime(),
            "eventId": "HeadShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        for (var i = 0; i < 10; i++) {
            achievementEngine.processEvent(headShotEvent, notifyUnlock);
        }
        for (var j = 0; j < 10; j++) {
            achievementEngine.processEvent(kneeShotEvent, notifyUnlock);
        }

        // check achievement removed
        achievements = achievementEngine.getAchievements();
        test.equals(Utils.arrayContains(achievements, achievement), false);
        var currentUnlockedAchievements;

        function notifyUnlock(unlockedAchievements) {
            currentUnlockedAchievements = unlockedAchievements;
        }

        test.ok(Utils.arrayContains(currentUnlockedAchievements, achievement));
        test.done();
    },

    testAchievementTypeMultiInfinite: function (test) {
        // set achievement without frequency property
        var achievement = FIXTURE.getStartGameAchievement();
        achievementEngine.registerAchievement(achievement);

        // check achievement registered
        var achievements = achievementEngine.getAchievements();
        test.ok(Utils.arrayContains(achievements, achievement));

        // trigger unlock event twice
        var event = {
            "eventId": "StartGameEvent",
            "gameId": "1",
            "userId": "2"
        };
        achievementEngine.processEvent(event, notifyUnlock);
        achievementEngine.processEvent(event, notifyUnlock);

        // check achievement still there
        achievements = achievementEngine.getAchievements();
        test.ok(Utils.arrayContains(achievements, achievement));

        function notifyUnlock(unlockedAchievements) {
            test.ok(Utils.arrayContains(unlockedAchievements, achievement));
        }

        test.done();
    },

    testAchievementTypeMultiTwoTimes: function (test) {
        var currentUnlockedAchievements = [];

        // set achievement with frequency property
        var achievement = FIXTURE.getTenHeadShotsAchievement();
        achievementEngine.registerAchievement(achievement);

        // check achievement registered
        var achievements = achievementEngine.getAchievements();
        test.ok(Utils.arrayContains(achievements, achievement));

        // trigger event to unlock first time
        var event = {
            "tsInit": new Date().getTime(),
            "eventId": "HeadShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        for (var i = 0; i < 10; i++) {
            achievementEngine.processEvent(event, notifyUnlock);
        }

        // check achievement still there
        achievements = achievementEngine.getAchievements();
        test.ok(Utils.arrayContains(achievements, achievement));

        // trigger event to unlock second time
        for (var i = 0; i < 10; i++) {
            achievementEngine.processEvent(event, notifyUnlock);
        }

        // check achievement removed
        achievements = achievementEngine.getAchievements();
        test.equals(Utils.arrayContains(achievements, achievement), false);

        function notifyUnlock(unlockedAchievements) {
            currentUnlockedAchievements = currentUnlockedAchievements.concat(unlockedAchievements);
        }

        test.ok(Utils.arrayContains(currentUnlockedAchievements, achievement));
        test.done();
    },

    testTenHeadShotsInTenMinutesAchievementUnlocked: function (test) {
        var allUnlockedAchievements = [];
        // set achievement
        var achievement = FIXTURE.getTenHeadShotsInTenMinutesAchievement();
        achievementEngine.registerAchievement(achievement);

        // trigger event to unlock
        var event = {
            "tsInit": new Date().getTime(),
            "eventId": "HeadShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        var initDate = Date.now() / 1000;
        for (var i = 0; i < 10; i++) {
            event.tsInit = initDate + (i); // add i x one seconds.
            achievementEngine.processEvent(event, notifyUnlock);
        }

        // check achievement removed
        var achievements = achievementEngine.getAchievements();
        test.equals(Utils.arrayContains(achievements, achievement), false);

        function notifyUnlock(unlockedAchievements) {
            allUnlockedAchievements = allUnlockedAchievements.concat(unlockedAchievements);
        }

        test.ok(Utils.arrayContains(allUnlockedAchievements, achievement));
        test.done();
    },

    testTenHeadShotsInTenMinutesAchievementLocked: function (test) {
        // set achievement
        var achievement = FIXTURE.getTenHeadShotsInTenMinutesAchievement();
        achievementEngine.registerAchievement(achievement);

        // trigger event to unlock
        var event = {
            "tsInit": new Date().getTime(),
            "eventId": "HeadShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        var initDate = Date.now() / 1000;
        for (var i = 0; i < 10; i++) {
            event.tsInit = initDate + (i * 120); // add i x two minutes.
            achievementEngine.processEvent(event, function (achievement) {
            });
        }
        achievement = ACHV.achievementWrapper(achievement);
        var rules = achievement.getRules();
        test.equals("satisfied", rules[0].state);
        test.equals(360, rules[0].timer);
        test.equals("inProgress", rules[1].state);
        test.equals(4, rules[1].counter);

        // check achievement not removed
        var achievements = achievementEngine.getAchievements();
        test.ok(Utils.arrayContains(achievements, achievement));
        test.done();
    },


    /**
     * Unlock achievement.
     * (TenHeadShots -> TenKneeShots) || TenChestShots
     * All events are triggered in row.
     * First TenHeadShots, then TenKneeShots and finally TenChestShots.
     */
    testTenHeadShotsSeqTenKneeShotsParTenChestShots: function (test) {
        // set achievement
        var achievement = FIXTURE.getTenHeadShotsSeqTenKneeShotsParTenChestShots();
        achievementEngine.registerAchievement(achievement);
        // trigger events
        var headShotEvent = {
            "tsInit": new Date().getTime(),
            "eventId": "HeadShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessEvent(achievementEngine, headShotEvent, 10);
        achievement = ACHV.achievementWrapper(achievement);
        var rules = achievement.getRules();
        test.equals("satisfied", rules[0].state);
        var kneeShotEvent = {
            "tsInit": new Date().getTime(),
            "eventId": "KneeShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessEvent(achievementEngine, kneeShotEvent, 10);
        rules = achievement.getRules();
        test.equals("satisfied", rules[1].state);
        var chestShotEvent = {
            "tsInit": new Date().getTime(),
            "eventId": "ChestShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessEvent(achievementEngine, chestShotEvent, 10);
        rules = achievement.getRules();
        test.equals("satisfied", rules[2].state);
        var achievements = achievementEngine.getAchievements();
        test.equals(Utils.arrayContains(achievements, achievement), false);
        test.done();
    },

    /**
     * Locked achievement.
     * (TenHeadShots -> TenKneeShots) || TenChestShots
     * Sequential events are triggered in wrong order.
     * First TenKneeShots, then TenHeadShots and finally TenChestShots.
     */
    testTenHeadShotsSeqTenKneeShotsParTenChestShotsTwo: function (test) {
        // set achievement
        var achievement = FIXTURE.getTenHeadShotsSeqTenKneeShotsParTenChestShots();
        achievementEngine.registerAchievement(achievement);
        achievement = ACHV.achievementWrapper(achievement);
        // trigger events
        var kneeShotEvent = {
            "tsInit": new Date().getTime(),
            "eventId": "KneeShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessEvent(achievementEngine, kneeShotEvent, 10);
        var rules = achievement.getRules();
        test.equals("inProgress", rules[1].state);
        var headShotEvent = {
            "tsInit": new Date().getTime(),
            "eventId": "HeadShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessEvent(achievementEngine, headShotEvent, 10);
        rules = achievement.getRules();
        test.equals("satisfied", rules[0].state);
        var chestShotEvent = {
            "tsInit": new Date().getTime(),
            "eventId": "ChestShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessEvent(achievementEngine, chestShotEvent, 10);
        rules = achievement.getRules();
        test.equals("satisfied", rules[2].state);
        var achievements = achievementEngine.getAchievements();
        test.ok(Utils.arrayContains(achievements, achievement));
        test.done();
    },

    /**
     * Unocked achievement.
     * (TenHeadShots -> TenKneeShots) || TenChestShots
     */
    testTenHeadShotsSeqTenKneeShotsParTenChestShotsThree: function (test) {
        // set achievement
        var achievement = FIXTURE.getTenHeadShotsSeqTenKneeShotsParTenChestShots();
        achievementEngine.registerAchievement(achievement);
        achievement = ACHV.achievementWrapper(achievement);
        var kneeShotEvent = {
            "tsInit": new Date().getTime(),
            "eventId": "KneeShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        var headShotEvent = {
            "tsInit": new Date().getTime(),
            "eventId": "HeadShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        var chestShotEvent = {
            "tsInit": new Date().getTime(),
            "eventId": "ChestShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        // trigger events
        multiProcessEvent(achievementEngine, kneeShotEvent, 10);
        var rules = achievement.getRules();
        test.equals("inProgress", rules[1].state);
        multiProcessEvent(achievementEngine, headShotEvent, 5);
        rules = achievement.getRules();
        test.equals("inProgress", rules[0].state);
        multiProcessEvent(achievementEngine, chestShotEvent, 5);
        rules = achievement.getRules();
        test.equals(rules[2].state, "inProgress");
        multiProcessEvent(achievementEngine, kneeShotEvent, 5);
        rules = achievement.getRules();
        test.equals(rules[1].state, "inProgress");
        multiProcessEvent(achievementEngine, chestShotEvent, 5);
        rules = achievement.getRules();
        test.equals(rules[2].state, "satisfied");
        multiProcessEvent(achievementEngine, headShotEvent, 5);
        rules = achievement.getRules();
        test.equals(rules[0].state, "satisfied");
        multiProcessEvent(achievementEngine, kneeShotEvent, 10);
        rules = achievement.getRules();
        test.equals(rules[1].state, "satisfied");
        var achievements = achievementEngine.getAchievements();
        test.equals(Utils.arrayContains(achievements, achievement), false);
        test.done();
    },

    testTenHeadShotsTenKneeShotsUninterruptible: function (test) {
        // set achievement
        var achievement = FIXTURE.getTenHeadShotsUninterruptableAndTenKneeShotsAchievement();
        achievementEngine.registerAchievement(achievement);
        achievement = ACHV.achievementWrapper(achievement);
        // trigger events
        var headShotEvent = {
            "tsInit": new Date().getTime(),
            "eventId": "HeadShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessEvent(achievementEngine, headShotEvent, 5);
        var rules = achievement.getRules();
        test.equals(5, rules[0].counter);
        var kneeShotEvent = {
            "tsInit": new Date().getTime(),
            "eventId": "KneeShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessEvent(achievementEngine, kneeShotEvent, 10);
        rules = achievement.getRules();
        test.equals(0, rules[1].counter);
        test.equals(0, rules[0].counter);
        test.done();
    },

    /**
     * Unlock achievement.
     * (TenHeadShots -> TenKneeShots) || TenChestShots || InTenMinutes
     */
    testCombinedAchievement: function (test) {
        //setup achievements
        var achievement = FIXTURE.getHeadKneeChestTenMinutesAchievement();
        achievementEngine.registerAchievement(achievement);
        // trigger events
        var currentDate = new Date().getTime();
        var headShotEvent = {
            "tsInit": currentDate,
            "eventId": "HeadShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        var kneeShotEvent = {
            "tsInit": currentDate,
            "eventId": "KneeShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        var chestShotEvent = {
            "tsInit": currentDate,
            "eventId": "ChestShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessTimedEvent(achievementEngine, chestShotEvent, 5, currentDate, 10);
        multiProcessTimedEvent(achievementEngine, headShotEvent, 1, currentDate, 10);
        multiProcessTimedEvent(achievementEngine, kneeShotEvent, 10, currentDate, 10);
        multiProcessTimedEvent(achievementEngine, chestShotEvent, 5, currentDate, 10);
        // assertion
        achievement = ACHV.achievementWrapper(achievement);
        var rules = achievement.getRules();
        test.equals(rules[0].state, "satisfied");
        test.equals(rules[1].state, "satisfied");
        test.equals(rules[2].state, "satisfied");
        test.equals(rules[3].state, "satisfied");
        test.done();
    },

    /**
     * Still locked.
     * (TenHeadShots -> TenKneeShots) || TenChestShots || InTenMinutes
     * During TenKneeShots there will be an interrupt by HeadShotEvent.
     */
    testCombinedAchievementInterrupt: function (test) {
        //setup achievements
        var achievement = FIXTURE.getHeadKneeChestTenMinutesAchievement();
        achievementEngine.registerAchievement(achievement);
        // trigger events
        var currentDate = new Date().getTime();
        // setup events
        var headShotEvent = {
            "tsInit": currentDate,
            "eventId": "HeadShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        var kneeShotEvent = {
            "tsInit": currentDate,
            "eventId": "KneeShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        var chestShotEvent = {
            "tsInit": currentDate,
            "eventId": "ChestShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessTimedEvent(achievementEngine, chestShotEvent, 5, currentDate, 10);
        currentDate = currentDate + 50;
        multiProcessTimedEvent(achievementEngine, headShotEvent, 1, currentDate, 10);
        currentDate = currentDate + 10;
        multiProcessTimedEvent(achievementEngine, kneeShotEvent, 9, currentDate, 10);
        currentDate = currentDate + 90;
        multiProcessTimedEvent(achievementEngine, headShotEvent, 1, currentDate, 10);
        currentDate = currentDate + 10;
        multiProcessTimedEvent(achievementEngine, kneeShotEvent, 3, currentDate, 10);
        currentDate = currentDate + 30;
        multiProcessTimedEvent(achievementEngine, chestShotEvent, 4, currentDate, 10);
        // assertion
        achievement = ACHV.achievementWrapper(achievement);
        var rules = achievement.getRules();
        test.equals("satisfied", rules[0].state);
        test.equals("inProgress", rules[1].state);
        test.equals(3, rules[1].counter);
        test.equals("inProgress", rules[2].state);
        test.equals(9, rules[2].counter);
        test.equals("satisfied", rules[3].state);
        test.equals(220, rules[3].timer);
        test.done();
    },

    /**
     * Still locked.
     * (TenHeadShots -> TenKneeShots) || TenChestShots || InTenMinutes
     * Timer first times out, but achievement will be unlocked in second try.
     */
    testCombinedAchievementTimer: function (test) {
        //setup achievements
        var achievement = FIXTURE.getHeadKneeChestTenMinutesAchievement();
        achievementEngine.registerAchievement(achievement);
        // trigger events
        var currentDate = Date.now() / 1000;
        // setup events
        var headShotEvent = {
            "tsInit": new Date().getTime(),
            "eventId": "HeadShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        var kneeShotEvent = {
            "tsInit": new Date().getTime(),
            "eventId": "KneeShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        var chestShotEvent = {
            "tsInit": new Date().getTime(),
            "eventId": "ChestShotEvent",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessTimedEvent(achievementEngine, chestShotEvent, 2, currentDate, 100);
        currentDate = currentDate + 200;
        multiProcessTimedEvent(achievementEngine, headShotEvent, 1, currentDate, 150);
        currentDate = currentDate + 150;
        multiProcessTimedEvent(achievementEngine, kneeShotEvent, 2, currentDate, 150);
        currentDate = currentDate + 300;
        achievement = ACHV.achievementWrapper(achievement);
        var rules = achievement.getRules();
        test.equals("satisfied", rules[0].state);
        test.equals("inProgress", rules[1].state);
        test.equals(2, rules[1].counter);
        test.equals("inProgress", rules[2].state);
        test.equals(2, rules[2].counter);
        test.equals("satisfied", rules[3].state);
        test.equals(500, rules[3].timer);
        // next event will break timer
        multiProcessTimedEvent(achievementEngine, kneeShotEvent, 1, currentDate, 200);
        currentDate = currentDate + 200;
        test.equals("inProgress", rules[0].state);
        test.equals("inProgress", rules[1].state);
        test.equals(0, rules[1].counter); // TODO test the case, when event is valid in sequence
        test.equals("inProgress", rules[2].state);
        test.equals(0, rules[2].counter);
        test.equals("inProgress", rules[3].state);
        test.equals(0, rules[3].timer);
        // unlock achievement
        multiProcessTimedEvent(achievementEngine, headShotEvent, 1, currentDate, 10);
        currentDate = currentDate + 10;
        multiProcessTimedEvent(achievementEngine, kneeShotEvent, 10, currentDate, 10);
        currentDate = currentDate + 100;
        multiProcessTimedEvent(achievementEngine, chestShotEvent, 10, currentDate, 10);
        test.equals("satisfied", rules[0].state);
        test.equals("satisfied", rules[1].state);
        test.equals(10, rules[1].counter);
        test.equals("satisfied", rules[2].state);
        test.equals(10, rules[2].counter);
        test.equals("satisfied", rules[3].state);
        test.equals(200, rules[3].timer);
        test.done();
    }

};

function multiProcessTimedEvent(achievementEngine, event, times, startTime, intervalDurationSec) {
    var unlockedAchievements = [];
    for (var i = 0; i < times; i++) {
        event.tsInit = startTime + i * intervalDurationSec;
        achievementEngine.processEvent(event, function notifyUnlock(achievements) {
            for (var j = 0; j < achievements.length; j++) {
                unlockedAchievements.push(achievements[j]);
            }
        });
    }
    return unlockedAchievements;
};

function multiProcessEvent(achievementEngine, event, times) {
    var unlockedAchievements = [];
    for (var i = 0; i < times; i++) {
        achievementEngine.processEvent(event, function notifyUnlock(achievements) {
            for (var j = 0; j < achievements.length; j++) {
                unlockedAchievements.push(achievements[j]);
            }
        });
    }
    return unlockedAchievements;
}

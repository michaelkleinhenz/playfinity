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
require('../../src/achievements/AchievementWrapper');
require('../../src/achievements/AchievementSystem');
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
        var achievement = FIXTURE.get10AIn10msAchievement();
        achievementEngine.registerAchievement(achievement);
        var achievements = achievementEngine.getAchievementsForEventType("EventA");
        test.equals(1, achievements.length);
        test.done();
    },

    testGetAchievement: function (test) {
        var achievement = FIXTURE.getStartGameAchievement();
        achievementEngine.registerAchievement(achievement);
        var resultAchievement = achievementEngine.getAchievement(achievement.name["en"]);
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
        var aAAchievement = FIXTURE.get10AAchievement();
        achievementEngine.registerAchievement(startGameAchievement);
        achievementEngine.registerAchievement(aAAchievement);
        var achievements = achievementEngine.getAchievements();
        test.ok(Utils.arrayContains(achievements, startGameAchievement));
        test.ok(Utils.arrayContains(achievements, aAAchievement));
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
        var achievement = FIXTURE.get10A10CAchievement();
        achievementEngine.registerAchievement(achievement);

        // check achievement registered
        var achievements = achievementEngine.getAchievements();
        test.ok(Utils.arrayContains(achievements, achievement));

        // trigger unlock event
        var eventC = {
            "tsInit": new Date().getTime(),
            "eventId": "EventC",
            "gameId": "1",
            "userId": "2"
        };
        var eventA = {
            "tsInit": new Date().getTime(),
            "eventId": "EventA",
            "gameId": "1",
            "userId": "2"
        };
        for (var i = 0; i < 10; i++) {
            achievementEngine.processEvent(eventA, notifyUnlock);
        }
        for (var j = 0; j < 10; j++) {
            achievementEngine.processEvent(eventC, notifyUnlock);
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
        var achievement = FIXTURE.get10AAchievement();
        achievementEngine.registerAchievement(achievement);

        // check achievement registered
        var achievements = achievementEngine.getAchievements();
        test.ok(Utils.arrayContains(achievements, achievement));

        // trigger event to unlock first time
        var event = {
            "tsInit": new Date().getTime(),
            "eventId": "EventA",
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

    test10AIn600000msAchievementUnlocked: function (test) {
        var allUnlockedAchievements = [];
        // set achievement
        var achievement = FIXTURE.get10AIn10msAchievement();
        achievementEngine.registerAchievement(achievement);

        // trigger event to unlock
        var event = {
            "tsInit": new Date().getTime(),
            "eventId": "EventA",
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

    test10Ain600000msAchievementLocked: function (test) {
        // set achievement
        var achievement = FIXTURE.get10AIn10msAchievement();
        achievementEngine.registerAchievement(achievement);

        // trigger event to unlock
        var event = {
            "tsInit": new Date().getTime(),
            "eventId": "EventA",
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
     * (10A -> 10C) || 10B
     * All events are triggered in row.
     * First 10A, then 10C and finally 10B.
     */
    test10A10Cwhile10BAchievement1: function (test) {
        // set achievement
        var achievement = FIXTURE.get10A10Cwhile10BAchievement();
        achievementEngine.registerAchievement(achievement);
        // trigger events
        var eventA = {
            "tsInit": new Date().getTime(),
            "eventId": "EventA",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessEvent(achievementEngine, eventA, 10);
        achievement = ACHV.achievementWrapper(achievement);
        var rules = achievement.getRules();
        test.equals("satisfied", rules[0].state);
        var eventC = {
            "tsInit": new Date().getTime(),
            "eventId": "EventC",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessEvent(achievementEngine, eventC, 10);
        rules = achievement.getRules();
        test.equals("satisfied", rules[1].state);
        var eventB = {
            "tsInit": new Date().getTime(),
            "eventId": "EventB",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessEvent(achievementEngine, eventB, 10);
        rules = achievement.getRules();
        test.equals("satisfied", rules[2].state);
        var achievements = achievementEngine.getAchievements();
        test.equals(Utils.arrayContains(achievements, achievement), false);
        test.done();
    },

    /**
     * Locked achievement.
     * (10A -> 10C) || 10B
     * Sequential events are triggered in wrong order.
     * First 10C, then 10A and finally 10B.
     */
    test10A10Cwhile10BAchievement2: function (test) {
        // set achievement
        var achievement = FIXTURE.get10A10Cwhile10BAchievement();
        achievementEngine.registerAchievement(achievement);
        achievement = ACHV.achievementWrapper(achievement);
        // trigger events
        var eventC = {
            "tsInit": new Date().getTime(),
            "eventId": "EventC",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessEvent(achievementEngine, eventC, 10);
        var rules = achievement.getRules();
        test.equals("inProgress", rules[1].state);
        var eventA = {
            "tsInit": new Date().getTime(),
            "eventId": "EventA",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessEvent(achievementEngine, eventA, 10);
        rules = achievement.getRules();
        test.equals("satisfied", rules[0].state);
        var eventB = {
            "tsInit": new Date().getTime(),
            "eventId": "EventB",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessEvent(achievementEngine, eventB, 10);
        rules = achievement.getRules();
        test.equals("satisfied", rules[2].state);
        var achievements = achievementEngine.getAchievements();
        test.ok(Utils.arrayContains(achievements, achievement));
        test.done();
    },

    /**
     * Unocked achievement.
     * (10A -> 10C) || 10B
     */
    test10A10Cwhile10BAchievement3: function (test) {
        // set achievement
        var achievement = FIXTURE.get10A10Cwhile10BAchievement();
        achievementEngine.registerAchievement(achievement);
        achievement = ACHV.achievementWrapper(achievement);
        var eventC = {
            "tsInit": new Date().getTime(),
            "eventId": "EventC",
            "gameId": "1",
            "userId": "2"
        };
        var eventA = {
            "tsInit": new Date().getTime(),
            "eventId": "EventA",
            "gameId": "1",
            "userId": "2"
        };
        var eventB = {
            "tsInit": new Date().getTime(),
            "eventId": "EventB",
            "gameId": "1",
            "userId": "2"
        };
        // trigger events
        multiProcessEvent(achievementEngine, eventC, 10);
        var rules = achievement.getRules();
        test.equals("inProgress", rules[1].state);
        multiProcessEvent(achievementEngine, eventA, 5);
        rules = achievement.getRules();
        test.equals("inProgress", rules[0].state);
        multiProcessEvent(achievementEngine, eventB, 5);
        rules = achievement.getRules();
        test.equals(rules[2].state, "inProgress");
        multiProcessEvent(achievementEngine, eventC, 5);
        rules = achievement.getRules();
        test.equals(rules[1].state, "inProgress");
        multiProcessEvent(achievementEngine, eventB, 5);
        rules = achievement.getRules();
        test.equals(rules[2].state, "satisfied");
        multiProcessEvent(achievementEngine, eventA, 5);
        rules = achievement.getRules();
        test.equals(rules[0].state, "satisfied");
        multiProcessEvent(achievementEngine, eventC, 10);
        rules = achievement.getRules();
        test.equals(rules[1].state, "satisfied");
        var achievements = achievementEngine.getAchievements();
        test.equals(Utils.arrayContains(achievements, achievement), false);
        test.done();
    },

    test10A10CAchievement1: function (test) {
        // set achievement
        var achievement = FIXTURE.get10A10CAchievement();
        achievementEngine.registerAchievement(achievement);
        achievement = ACHV.achievementWrapper(achievement);
        // trigger events
        var eventA = {
            "tsInit": new Date().getTime(),
            "eventId": "EventA",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessEvent(achievementEngine, eventA, 5);
        var rules = achievement.getRules();
        test.equals(5, rules[0].counter);
        var eventC = {
            "tsInit": new Date().getTime(),
            "eventId": "EventC",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessEvent(achievementEngine, eventC, 10);
        rules = achievement.getRules();
        test.equals(rules[0].counter, 5);
        test.equals(rules[1].counter, 0);
        test.done();
    },

    /**
     * Unlock achievement.
     * (A -> 10C) || 10B || In600000ms
     */
    testCombinedAchievement: function (test) {
        //setup achievements
        var achievement = FIXTURE.getA10Cwhile10Bin600000msAchievement();
        achievementEngine.registerAchievement(achievement);
        // trigger events
        var currentDate = new Date().getTime();
        var eventA = {
            "tsInit": currentDate,
            "eventId": "EventA",
            "gameId": "1",
            "userId": "2"
        };
        var eventC = {
            "tsInit": currentDate,
            "eventId": "EventC",
            "gameId": "1",
            "userId": "2"
        };
        var eventB = {
            "tsInit": currentDate,
            "eventId": "EventB",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessTimedEvent(achievementEngine, eventB, 5, currentDate, 10);
        multiProcessTimedEvent(achievementEngine, eventA, 1, currentDate, 10);
        multiProcessTimedEvent(achievementEngine, eventC, 10, currentDate, 10);
        multiProcessTimedEvent(achievementEngine, eventB, 10, currentDate, 10);
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
     * (A -> 10C) || 10B || In600000ms
     * During 10C there will be an interrupt by EventA.
     */
    testCombinedAchievementInterrupt: function (test) {
        //setup achievements
        var achievement = FIXTURE.getA10Cwhile10Bin600000msAchievement();
        achievementEngine.registerAchievement(achievement);
        // trigger events
        var currentDate = new Date().getTime();
        // setup events
        var eventA = {
            "tsInit": currentDate,
            "eventId": "EventA",
            "gameId": "1",
            "userId": "2"
        };
        var eventC = {
            "tsInit": currentDate,
            "eventId": "EventC",
            "gameId": "1",
            "userId": "2"
        };
        var eventB = {
            "tsInit": currentDate,
            "eventId": "EventB",
            "gameId": "1",
            "userId": "2"
        };
        multiProcessTimedEvent(achievementEngine, eventB, 5, currentDate, 10);
        currentDate = currentDate + 50;
        multiProcessTimedEvent(achievementEngine, eventA, 1, currentDate, 10);
        currentDate = currentDate + 10;
        multiProcessTimedEvent(achievementEngine, eventC, 9, currentDate, 10);
        currentDate = currentDate + 90;
        multiProcessTimedEvent(achievementEngine, eventA, 1, currentDate, 10);
        currentDate = currentDate + 10;
        multiProcessTimedEvent(achievementEngine, eventC, 3, currentDate, 10);
        currentDate = currentDate + 30;
        multiProcessTimedEvent(achievementEngine, eventB, 4, currentDate, 10);
        // assertion
        achievement = ACHV.achievementWrapper(achievement);
        var rules = achievement.getRules();
        test.equals(rules[0].state, "satisfied");
        test.equals(rules[1].state, "inProgress");
        test.equals(rules[1].counter, 3);
        test.equals(rules[2].state, "inProgress");
        test.equals(rules[2].counter, 9);
        test.equals(rules[3].state, "satisfied");
        test.equals(rules[3].timer, 220);
        test.done();
    },

    /**
     * Still locked.
     * (A -> 10C) || 10B || In600000ms
     * Timer first times out, but achievement will be unlocked in second try.
     */
    testCombinedAchievementTimer: function (test) {

        //setup achievements
        var achievement = FIXTURE.getA10Cwhile10Bin600000msAchievement();
        achievementEngine.registerAchievement(achievement);

        // setup events
        var eventA = {
            "tsInit": 0,
            "eventId": "EventA",
            "gameId": "1",
            "userId": "2"
        };
        var eventC = {
            "tsInit": 0,
            "eventId": "EventC",
            "gameId": "1",
            "userId": "2"
        };
        var eventB = {
            "tsInit": 0,
            "eventId": "EventB",
            "gameId": "1",
            "userId": "2"
        };

        // first try

        // send eventB at time 0
        eventB.tsInit = 0;
        achievementEngine.processEvent(eventB, function notifyUnlock(achievements) {});

        // send eventB at time 100
        eventB.tsInit = 100;
        achievementEngine.processEvent(eventB, function notifyUnlock(achievements) {});

        // send eventA at time 200
        eventA.tsInit = 200;
        achievementEngine.processEvent(eventA, function notifyUnlock(achievements) {});

        // send eventC at time 300
        eventC.tsInit = 300;
        achievementEngine.processEvent(eventC, function notifyUnlock(achievements) {});

        // send eventC at time 400
        eventC.tsInit = 400;
        achievementEngine.processEvent(eventC, function notifyUnlock(achievements) {});

        // check current status
        var rules = ACHV.achievementWrapper(achievement).getRules();
        test.equals(rules[0].state, "satisfied");   // OneShotRule, set A, sequence 1
        test.equals(rules[1].state, "inProgress");  // CounterRule, set A, sequence 2
        test.equals(rules[1].counter, 2);           // CounterRule, set A, sequence 2
        test.equals(rules[2].state, "inProgress");  // CounterRule, set B, sequence 1
        test.equals(rules[2].counter, 2);           // CounterRule, set B, sequence 1
        test.equals(rules[3].state, "satisfied");   // TimerRule, set C, sequence 1
        test.equals(rules[3].timer, 400);           // TimerRule, set C, sequence 1

        // break timer: send eventC at time 600001
        eventC.tsInit = 600001;
        achievementEngine.processEvent(eventC, function notifyUnlock(achievements) {});

        // check current status
        test.equals(rules[0].state, "inProgress");  // OneShotRule, set A, sequence 1
        test.equals(rules[1].state, "inProgress");  // CounterRule, set A, sequence 2
        test.equals(rules[1].counter, 0);           // CounterRule, set A, sequence 2
        test.equals(rules[2].state, "inProgress");  // CounterRule, set B, sequence 1
        test.equals(rules[2].counter, 0);           // CounterRule, set B, sequence 1
        test.equals(rules[3].state, "inProgress");  // TimerRule, set C, sequence 1
        test.equals(rules[3].timer, 0);             // TimerRule, set C, sequence 1

        // second try

        // send eventA at time 600100
        eventA.tsInit = 600100;
        achievementEngine.processEvent(eventA, function notifyUnlock(achievements) {});

        // send 10 eventCs starting time 600200 with 100 increment
        eventC.tsInit = 600200;
        multiProcessTimedEvent(achievementEngine, eventC, 10, 600200, 100);

        // send 10 eventBs starting time 610000 with 100 increment
        eventB.tsInit = 610000;
        multiProcessTimedEvent(achievementEngine, eventB, 10, 610000, 100);

        // check current status
        test.equals(rules[0].state, "satisfied");  // OneShotRule, set A, sequence 1
        test.equals(rules[1].state, "satisfied");  // CounterRule, set A, sequence 2
        test.equals(rules[1].counter, 10);         // CounterRule, set A, sequence 2
        test.equals(rules[2].state, "satisfied");  // CounterRule, set B, sequence 1
        test.equals(rules[2].counter, 10);         // CounterRule, set B, sequence 1
        test.equals(rules[3].state, "satisfied");  // TimerRule, set C, sequence 1
        test.equals(rules[3].timer, 10800);        // TimerRule, set C, sequence 1

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

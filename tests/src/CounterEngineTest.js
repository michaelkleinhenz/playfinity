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

// load fixtures
require('../fixtures/AchievementFixtures.js');

module.exports = {

    "Process to unlock event": function(test) {
        var engine = ACHV.counterEngine({"achievementType": "CounterRule"});
        var event = {
            "eventId": "EventA",
            "gameId": "1",
            "userId": "2"
        };
        var achievement = ACHV.achievementWrapper(FIXTURE.get10AAchievement());
        var rules = achievement.getRules();
        for (var i = 0; i < 10; i++) {
            engine.process(event, rules[0], function(isChanged) {});
        }
        test.equals("satisfied", rules[0].state);
        test.done();
    },

    "Process still locked single counter": function(test) {
        var engine = ACHV.counterEngine({"achievementType": "CounterRule"});
        var event = {
            "eventId": "EventA",
            "gameId": "1",
            "userId": "2"
        };
        var achievement = ACHV.achievementWrapper(FIXTURE.get10AAchievement());
        var rules = achievement.getRules();
        engine.process(event, rules[0], function(isChanged) {});
        test.equals(rules[0].state, "inProgress");
        test.done();
    },

    "Process to unlock event alternate": function (test) {
        var engine = ACHV.counterEngine({"achievementType": "CounterRule"});
        var eventA = {
            "eventId": "EventA",
            "gameId": "1",
            "userId": "2"
        };
        var eventC = {
            "eventId": "EventC",
            "gameId": "1",
            "userId": "2"
        };
        var achievement = ACHV.achievementWrapper(FIXTURE.get10A10CAchievement());
        var rules = achievement.getRules();
        for (var i = 0; i < 10; i++) {
            engine.process(eventA, rules[0], function(isChanged) {});
            engine.process(eventC, rules[1], function(isChanged) {});
        }
        test.equals("satisfied", rules[0].state);
        test.equals("satisfied", rules[1].state);
        test.done();
    },

    "Process to unlock event in row": function (test) {
        var engine = ACHV.counterEngine({"achievementType": "CounterRule"});
        var eventA = {
            "eventId": "EventA",
            "gameId": "1",
            "userId": "2"
        };
        var eventC = {
            "eventId": "EventC",
            "gameId": "1",
            "userId": "2"
        };
        var achievement = ACHV.achievementWrapper(FIXTURE.get10A10CAchievement());
        var rules = achievement.getRules();
        for (var i = 0; i < 10; i++) {
            engine.process(eventA, rules[0], function(isChanged) {});
        }
        for (var j = 0; j < 10; j++) {
            engine.process(eventC, rules[1], function(isChanged) {});
        }
        test.equals("satisfied", rules[0].state);
        test.equals("satisfied", rules[1].state);
        test.done();
    },

    "Testing process locking": function(test) {
        var engine = ACHV.counterEngine({"achievementType": "CounterRule"});
        var eventC = {
            "eventId": "EventC",
            "gameId": "1",
            "userId": "2"
        };
        var achievement = ACHV.achievementWrapper(FIXTURE.get10A10CAchievement());
        for (var i = 0; i < 10; i++) {
            engine.process(eventC, achievement, function(isChanged) {});
        }
        test.ok(achievement.locked);
        test.done();
    }
};
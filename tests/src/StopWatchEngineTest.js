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

    "Unlocking stop watch achievement" : function(test) {
        var engine = ACHV.stopWatchEngine({"achievementType": "StopWatchRule"})
        var startGameEvent = {
            "tsInit": new Date().getTime(),
            "eventId": "StartGameEvent",
            "gameId": "1",
            "userId": "2"
        };
        var stopGameEvent = {
            "tsInit": new Date().getTime(),
            "eventId": "StopGameEvent",
            "gameId": "1",
            "userId": "2"
        };
        var achievement = ACHV.achievementWrapper(FIXTURE.getPlayForTenSecondsAchievement());
        var rules = achievement.getRules();
        engine.process(startGameEvent, rules[0], function () {});
        engine.process(stopGameEvent, rules[0], function () {});
        test.equals(rules[0].state, "broken");
        test.done();
    }
};
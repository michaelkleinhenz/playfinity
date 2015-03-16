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
var EventEmitter = require('../../service/util/EventEmitter-4.0.2.min.js').EventEmitter;

global.Async = require('async');

global.JsHamcrest = require('../libs/jshamcrest-0.6.8.js').JsHamcrest;
JsHamcrest.Integration.Nodeunit();

global.JsMockito = require('../libs/jsmockito-1.0.4.js').JsMockito;
JsMockito.Integration.Nodeunit();

// load achievement system class
global.ACHV = require("../../service/achievements/ACHV.js");
require('require-dir')('../../src/achievements/engine');
require('../../service/achievements/AchievementProcessor');
require('../../service/achievements/AchievementEngine');
require('../../service/achievements/AchievementWrapper');
require('../../service/achievements/AchievementSystem');
require('../../service/store/AchievementStore');
require('../../service/store/AchievementInstanceStore');

// load fixtures
require('../fixtures/AchievementFixtures.js');

module.exports = {

    "Simple one shot achievement unlocking" : function (test) {
        var engine = ACHV.oneShotEngine({"achievementType": "OneShotRule"});
        var event = {
            "eventId": "StartGameEvent",
            "gameId": "1",
            "userId": "2"
        };
        var achievement = ACHV.achievementWrapper(FIXTURE.getStartGameAchievement());
        var rules = achievement.getRules();
        engine.process(event, rules[0], function(){});
        test.equals(rules[0].state, "satisfied");
        test.done();
    }
};
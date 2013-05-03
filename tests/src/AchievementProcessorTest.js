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

require('../fixtures/AchievementFixtures.js')

module.exports = {

        testProcessAchievement: function () {
        "use strict";
        var processor = ACHV.achievementProcessor(),
            achievement = FIXTURE.getStartGameAchievement(),
            event = FIXTURE.getStartGameEvent(),
            engines = {
                "TimerRule": ACHV.timerEngine({"achievementType": "TimerRule"}),
                "OneShotRule": new ACHV.OneShotEngine(),
                "CounterRule": new ACHV.CounterEngine(),
                "StopWatchRule": ACHV.stopWatchEngine({"achievementType": "StopWatchRule"})
            };
        processor.process(achievement, engines, event, function (error, result) {
            assertNull(error);
            assertTrue(result.isUnlocked);
            assertTrue(result.isValueChanged);
        });
    }
};
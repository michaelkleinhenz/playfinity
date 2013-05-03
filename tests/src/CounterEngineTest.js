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

        testProcessToUnlockEvent: function() {
        var isLocked = true;
        var engine = new ACHV.CounterEngine();
        var event = FIXTURE.getHeadShotEvent();
        var achievement = FIXTURE.getTenHeadShotsAchievement();
        achievement = ACHV.achievementWrapper(achievement);
        var rules = achievement.getRules();
        for (var i = 0; i < 10; i++) {
            engine.process(event, rules[0], this.valueChanged);
        }
        assertEquals("satisfied", rules[0].state);
    },

    testProcessStillLockedSingleCounter: function() {
        var engine = new ACHV.CounterEngine(),
            event = FIXTURE.getHeadShotEvent(),
            achievement = ACHV.achievementWrapper(FIXTURE.getTenHeadShotsAchievement()),
            rules = achievement.getRules();

        engine.process(event, rules[0], this.valueChanged);
        assertEquals("inProgress", rules[0].state);
    },

    testProcessToUnlockEventAlternate: function () {
        "use strict";
        var isLocked = true;
        var engine = new ACHV.CounterEngine();
        var headShotEvent = FIXTURE.getHeadShotEvent();
        var kneeShotEvent = FIXTURE.getKneeShotEvent();
        var achievement = FIXTURE.getTenHeadAndKneeShotsAchievement();
        achievement = ACHV.achievementWrapper(achievement);
        var rules = achievement.getRules();
        for (var i = 0; i < 10; i++) {
            engine.process(headShotEvent, rules[0], this.valueChanged);
            engine.process(kneeShotEvent, rules[1], this.valueChanged);
        }
        assertEquals("satisfied", rules[0].state);
        assertEquals("satisfied", rules[1].state);
    },

    testProcessToUnlockEventInRow: function () {
        var isLocked = true;
        var engine = new ACHV.CounterEngine();
        var headShotEvent = FIXTURE.getHeadShotEvent();
        var kneeShotEvent = FIXTURE.getKneeShotEvent();
        var achievement = FIXTURE.getTenHeadAndKneeShotsAchievement();
        achievement = ACHV.achievementWrapper(achievement);
        var rules = achievement.getRules();
        for (var i = 0; i < 10; i++) {
            engine.process(headShotEvent, rules[0], this.valueChanged);
        }
        for (var j = 0; j < 10; j++) {
            engine.process(kneeShotEvent, rules[1], this.valueChanged);
        }
        assertEquals("satisfied", rules[0].state);
        assertEquals("satisfied", rules[1].state);
    },

    testProcessStillLocked: function() {
        var isLocked = true;
        var engine = new ACHV.CounterEngine();
        var kneeShotEvent = FIXTURE.getKneeShotEvent();
        var achievement = FIXTURE.getTenHeadAndKneeShotsAchievement();
        var callback = function(unlockedAchievement) {
        };
        for (var i = 0; i < 10; i++) {
            engine.process(kneeShotEvent, achievement, callback);
        }
        assertTrue(isLocked);
    },

    valueChanged: function(isChanged) {

    }
};
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

    setUp: function(callback) {
        "use strict";
        var db = {
                view: function () {},
                destroy: function () {}
            },
            dbMock = mock(db),
            logger = {
                error: function () {}
            },
            conf = {
                "db": dbMock,
                "logger": logger
            };

        when(dbMock).view(anything()).
            then(function (table, design, key, callback) {
                if (key.key === 1) {
                    callback("error", "result");
                } else {
                    if (key.key[1] === "ErrorAchievement") {
                        callback("error", null);
                    } else {
                        callback(null, "result");
                    }
                }
            });

        when(dbMock).destroy(anything()).
            then(function (name, revision, callback) {
                if (revision === "error_revision") {
                    callback("revision error", null);
                } else {
                    callback(null, "some result");
                }
            });

        this.store = ACHV.achievementStore(conf);
    },

    testGetAchievementsForGameId: function () {
        "use strict";
        this.store.getAchievementsForGameId(1, getAchievementsForGameIdCallback);

        function getAchievementsForGameIdCallback(error, result) {
            assertEquals("error", error);
            assertEquals("result", result);
        }
    },

    testDeleteAchievement: function () {
        "use strict";
        this.store.deleteAchievement("name", "revision", deleteAchievementCallback);

        function deleteAchievementCallback(error, result) {
            assertNull(error);
            assertEquals("some result", result);
        }
    },

    testDeleteAchievementError: function () {
        "use strict";
        this.store.deleteAchievement("name", "error_revision", deleteAchievementCallback);

        function deleteAchievementCallback(error, result) {
            assertNotNull(error);
            assertNull(result);
        }
    },

    testGetAchievementByGameIdAndName: function () {
        "use strict";
        var gameId = 2,
            achievementName = "FirstStartAchievement";
        this.store.getAchievementByGameIdAndName(gameId, achievementName, getAchievementCallback);

        function getAchievementCallback(error, result) {
            assertNull(error);
            assertNotNull(result);
        }
    },

    testGetAchievementByGameIdAndNameError: function () {
        "use strict";
        var gameId = 2,
            achievementName = "ErrorAchievement";
        this.store.getAchievementByGameIdAndName(gameId, achievementName, getAchievementCallback);

        function getAchievementCallback(error, result) {
            assertNotNull(error);
            assertNull(result);
        }
    }
};
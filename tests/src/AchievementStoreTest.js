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
require('../../src/store/AchievementInstanceStore');
var store = require('../../src/store/AchievementStore');

// load fixtures
require('../fixtures/AchievementFixtures.js');

module.exports = {

    setUp: function(callback) {
        var db = {
                view: function () {},
                destroy: function () {}
        };
        var dbMock = mock(db);
        var logger = {
                error: function () {}
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

        this.store = store.achievementStore(dbMock, logger);
        callback();
    },

    "Get achievements for game id": function (test) {
        this.store.getAchievementsForGameId(1, getAchievementsForGameIdCallback);
        function getAchievementsForGameIdCallback(error, result) {
            test.equal("error", error);
            test.equal("result", result);
        }
        test.done();
    },

    "Deleting achievement": function (test) {
        this.store.deleteAchievement("name", "revision", deleteAchievementCallback);

        function deleteAchievementCallback(error, result) {
            test.equal(error, null);
            test.equal("some result", result);
        }
        test.done();
    },

    "Failed deleting achievement": function (test) {
        this.store.deleteAchievement("name", "error_revision", deleteAchievementCallback);

        function deleteAchievementCallback(error, result) {
            test.notEqual(error, null);
            test.equal(result, null);
        }
        test.done();
    },

    "Get achievement by game id and name": function (test) {
        var gameId = 2,
            achievementName = "FirstStartAchievement";
        this.store.getAchievementByGameIdAndName(gameId, achievementName, getAchievementCallback);

        function getAchievementCallback(error, result) {
            test.equal(error, null);
            test.notEqual(result, null);
        }
        test.done();
    },

    "Failed getting achievement by game id and name": function (test) {
        var gameId = 2,
            achievementName = "ErrorAchievement";
        this.store.getAchievementByGameIdAndName(gameId, achievementName, getAchievementCallback);

        function getAchievementCallback(error, result) {
            test.notEqual(error, null);
            test.equal(result, null);
        }
        test.done();
    }
};
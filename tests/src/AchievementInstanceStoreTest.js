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
global.Utils = require('../../src/util/utils');

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
require('../../src/store/AchievementStore');
var instanceStore = require('../../src/store/AchievementInstanceStore');

// load fixtures
require('../fixtures/AchievementFixtures.js');

module.exports = {

    setUp: function(callback) {
        var db = {
                insert: function () {},
                destroy: function (docName, revision, callback) {}
        };
        var dbMock = mock(db);
        var logger = {
                error: function () {}
        };

        when(dbMock).insert(anything()).
            then(function (doc, callback) {
                callback("SomeError", null);
            });

        when(dbMock).destroy(anything()).
            then(function (docName, revision, callback) {
                if (revision === "error_revision") {
                    callback("DestroyError", null);
                } else {
                    callback(null, "Body");
                }
            });
        this.store = instanceStore.achievementInstanceStore(dbMock, logger);
        callback();
    },

    "Failed creating or updating achievement instance": function (test) {
        this.store.createOrUpdateAchievementInstance("doc", function(error, result) {
            test.equals("SomeError", error);
            test.equals(result, null);
        });
        test.done();
    },

    "Deleting achievement instance": function (test) {
        this.store.deleteAchievement("docname", "revision", function(error, result) {
            test.equals(error, null);
            test.equals("Body", result);
        });
        test.done();
    },

    "Failed deleting achievement instance": function (test) {
        this.store.deleteAchievement("docname", "error_revision", function(error, result) {
            test.equals("DestroyError", error);
            test.equals(result, null);
        });
        test.done();
    }
};
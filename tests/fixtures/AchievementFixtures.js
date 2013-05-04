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

var fs = require("fs");

FIXTURE = {

    getFixtureObj: function(fixtureFileName) {
        var fileContents = fs.readFileSync(fixtureFileName,'utf8');
        var obj = JSON.parse(fileContents);
        return obj;
    },

    getStartGameAchievement: function() {
        return FIXTURE.getFixtureObj("tests/fixtures/achievements/StartGameAchievement.json");
    },

    getFirstStartAchievement: function() {
        return FIXTURE.getFixtureObj("tests/fixtures/achievements/FirstStartAchievement.json");
    },

    get10AAchievement: function() {
        return FIXTURE.getFixtureObj("tests/fixtures/achievements/10AAchievement.json");
    },

    get10A10CAchievement: function() {
        return FIXTURE.getFixtureObj("tests/fixtures/achievements/10A10CAchievement.json");
    },

    getPlayFor10000msAchievement: function() {
        return FIXTURE.getFixtureObj("tests/fixtures/achievements/PlayFor10000msAchievement.json");
    },

    get10AIn10msAchievement: function() {
        return FIXTURE.getFixtureObj("tests/fixtures/achievements/10AIn10msAchievement.json");
    },

    get10A10Cwhile10BAchievement: function() {
        return FIXTURE.getFixtureObj("tests/fixtures/achievements/10A10Cwhile10BAchievement.json");
    },

    get10A10CAchievement: function() {
        return FIXTURE.getFixtureObj("tests/fixtures/achievements/10A10CAchievement.json");
    },

    getA10Cwhile10Bin600000msAchievement: function() {
        return FIXTURE.getFixtureObj("tests/fixtures/achievements/A10Cwhile10Bin600000msAchievement.json");
    },

    get2AAchievement: function() {
        return FIXTURE.getFixtureObj("tests/fixtures/achievements/2AAchievement.json");
    }
};
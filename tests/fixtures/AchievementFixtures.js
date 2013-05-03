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

FIXTURE = {

    getFixtureObj: function(fixtureFileName) {
        var obj = require(fixtureFileName);
        return obj;
    },

    getStartGameAchievement: function() {
        return FIXTURE.getFixtureObj("../fixtures/achievements/StartGameAchievement.json");
    },

    getFirstStartAchievement: function() {
        return FIXTURE.getFixtureObj("../fixtures/achievements/FirstStartAchievement.json");
    },

    getTenHeadShotsAchievement: function() {
        return FIXTURE.getFixtureObj("../fixtures/achievements/TenHeadShotsAchievement.json");
    },

    getTenHeadAndKneeShotsAchievement: function() {
        return FIXTURE.getFixtureObj("../fixtures/achievements/TenHeadAndKneeShotsAchievement.json");
    },

    getPlayForTenSecondsAchievement: function() {
        return FIXTURE.getFixtureObj("../fixtures/achievements/PlayForTenSecondsAchievement.json");
    },

    getTenHeadShotsInTenMinutesAchievement: function() {
        return FIXTURE.getFixtureObj("../fixtures/achievements/TenHeadShotsInTenMinutesAchievement.json");
    },

    getTenHeadShotsSeqTenKneeShotsParTenChestShots: function() {
        return FIXTURE.getFixtureObj("../fixtures/achievements/TenHeadShotsSeqTenKneeShotsParTenChestShotsAchievement.json");
    },

    getTenHeadShotsUninterruptableAndTenKneeShotsAchievement: function() {
        return FIXTURE.getFixtureObj("../fixtures/achievements/TenHeadShotsUninterruptableAndTenKneeShotsAchievement.json");
    },

    getHeadKneeChestTenMinutesAchievement: function() {
        return FIXTURE.getFixtureObj("../fixtures/achievements/HeadKneeChestInTenMinutesAchievement.json");
    },

    getTwoHeadShotsAchievement: function() {
        return FIXTURE.getFixtureObj("../fixtures/achievements/TwoHeadShotsAchievement.json");
    }

};
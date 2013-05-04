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

/*
 * Head class for the achievement system. Handles initialization, basic
 * i/o and events.
 */

ACHV.AchievementSystem = function (conf) {
    "use strict";
    var self = {},
        achvInstanceStore = conf.achievementInstanceStore,
        achvEngines = this.achievementEngines = conf.achievementEngines,
        achvEngineConf = {
            "eventBus": conf.eventBus
        };

    self.ee = this.ee = conf.eventBus;

    function initAchievementEngine(event, unlockCallback) {
        // console.log("initAchievmentEngine()");
        achvInstanceStore.getAchievementsForGameIdAndUserId(event.gameId, event.userId, function callback(error, body, header) {
            if (error) {
                unlockCallback(error, null);
            } else {
                if (body.rows.length > 0) {
                    // console.log("initAchievementEngine: body=" + JSON.stringify(body));
                    body.rows.forEach(registerAchievement);
                    self.ee.emitEvent('achv_engine_initialized', [event, unlockCallback]);
                }
            }
        });

        function registerAchievement(doc) {
            var achvEngine = achvEngines[event.gameId + "_" + event.userId],
                achievementInstance = doc.value;
            if (achievementInstance.locked) {
                if (achvEngine) {
                    //console.log("registerAchievement: doc=" + JSON.stringify(doc));
                    achvEngine.registerAchievement(achievementInstance);
                } else {
                    achvEngine = new ACHV.AchievementEngine(achvEngineConf);
                    achvEngine.registerAchievement(achievementInstance);
                    achvEngines[event.gameId + "_" + event.userId] = achvEngine;
                }
            }
        }
    }

    function processEvent(event, unlockCallback) {
        var achvEngine = achvEngines[event.gameId + "_" + event.userId];
        if (achvEngine) {
            achvEngine.processEvent(event, unlockCallback);
        } else {
            self.ee.emitEvent("no_achv_engine", [event, unlockCallback]);
        }
    }

    function updateAchievement(achievement) {
        //console.log("AchievementSystem.updateAchievement(" + JSON.stringify(achievement) + ")");
        achvInstanceStore.createOrUpdateAchievementInstance(achievement, function (error, body) {
            if (error) {
                console.log("Error: not able to update achievement instance with id=" + JSON.stringify(achievement._id) + ": " + error);
            } else {
                //console.log("Updated achievement instance. body:" + JSON.stringify(body));
                achievement._rev = body.rev;
            }
        });
    }

    this.ee.addListeners({
        event_triggered: processEvent,
        no_achv_engine: initAchievementEngine,
        achv_engine_initialized: processEvent,
        achv_value_changed: updateAchievement,
        achv_removed: achvInstanceStore.deleteAchievement
    });
};

ACHV.AchievementSystem.prototype.getAchievementEngineForGameAndUser = function(gameId, userId, callback) {
    callback(this.achievementEngines[gameId + "_" + userId]);
};

ACHV.AchievementSystem.prototype.registerGame = function(game) {
    this.game = game;
};

ACHV.AchievementSystem.prototype.isRegistered = function(game) {
    return this.game === game;
};

ACHV.AchievementSystem.prototype.triggerEvent = function (event, notifyUnlockCallback) {
    // console.log("triggerEvent() " + JSON.stringify(event));
    this.ee.emitEvent('event_triggered', [event, notifyUnlockCallback]);
};

ACHV.AchievementSystem.prototype.isAchievementUnlocked = function (gameId, userId, achievement) {
    var isUnlocked = false;
    var achievements = this.achievementEngines[gameId + "_" + userId].getAchievements();
    var index = achievements.indexOf(achievement);
    if (index > -1) {
        var currentAchievement = achievements[index];
        isUnlocked = !currentAchievement.locked;
    }
    return isUnlocked;
};

exports.AchievementSystem = ACHV.AchievementSystem;
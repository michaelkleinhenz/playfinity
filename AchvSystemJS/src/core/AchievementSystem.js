/*global ACHV*/
ACHV.AchievementSystem = function (conf) {
    "use strict";
    var self = {},
        achvStore = conf.achievementStore,
        achvInstanceStore = conf.achievementInstanceStore,
        achvEngines = this.achievementEngines = conf.achievementEngines,
        achvEngineConf = {
            "eventBus": conf.eventBus
        };

    self.ee = this.ee = conf.eventBus;

    function initAchievements(id, callback) {
        achvStore.getAchievementsForGameId(id.gameId, function getAchievementsForGameIdCallback(error, body, header) {
            if (error) {
                console.log("Not able to get achievements for gameId: " + id.gameId + " Error: " + error);
                callback(error, null);
            } else {
                console.log("getAchievementsForGameId:" + JSON.stringify(body));
                if (body.rows.length > 0) {
                    body.rows.forEach(createAchievementInstance);
                } else {
                    console.log("initAchievements - No achievements for id:"  + JSON.stringify(id));
                }
                callback(null, "Achievement instances created.");
            }
        });

        function createAchievementInstance(doc) {
            // console.log("createAchievementInstance doc: " +  JSON.stringify(doc));
            var achievementInstance = doc.value;
            achievementInstance.gameId = id.gameId;
            achievementInstance.userId = id.userId;
            achvInstanceStore.createOrUpdateAchievementInstance(achievementInstance, function (error, body) {
                if (error) {
                    console.log("Not able to create achievement instance for doc: " + JSON.stringify(doc) + " Error:" + error);
                } else {
                    console.log("Created achievement instance. body:" + JSON.stringify(body));
                }
            });
        }
    }

    function initAchievementEngine(event, unlockCallback) {
        // console.log("initAchievmentEngine()");
        achvInstanceStore.getAchievementsForGameIdAndUserId(event.gameId, event.userId, function callback(error, body, header) {
            if (error) {
                console.log("Not able to get achievements: " + error);
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
            console.log("registerAchievement: doc=" + JSON.stringify(doc));
            var achvEngine = achvEngines[event.gameId + "_" + event.userId],
                achievementInstance = doc.value;
            if (achvEngine) {
                achvEngine.registerAchievement(achievementInstance);
            } else {
                achvEngine = new ACHV.AchievementEngine(achvEngineConf);
                achvEngine.registerAchievement(achievementInstance);
                achvEngines[event.gameId + "_" + event.userId] = achvEngine;
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
        // console.log("updateAchievement(" + JSON.stringify(achievement) + ")");
        achvInstanceStore.createOrUpdateAchievementInstance(achievement, function (error, body) {
            if (error) {
                console.log("Not able to update achievement instance: " + JSON.stringify(achievement) + " Error:" + error);
            } else {
                console.log("Updated achievement instance. body:" + JSON.stringify(body));
            }
        });
    }

    this.ee.addListeners({
        event_triggered: processEvent,
        init_achievements: initAchievements,
        no_achv_engine: initAchievementEngine,
        achv_engine_initialized: processEvent,
        achv_value_changed: updateAchievement,
        achv_removed: achvInstanceStore.deleteAchievement
    });
};

ACHV.AchievementSystem.prototype.getAchievementEngineForGameAndUser = function(gameId, userId, callback) {
    callback(this.achievementEngines[gameId + "_" +userId]);
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

ACHV.AchievementSystem.prototype.initAchievements = function (id, callback) {
    this.ee.emitEvent('init_achievements', [id, callback]);
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
ACHV.AchievementSystem = function(conf) {
    var self = {};

    var achvStore = conf.achievementStore;
    var achvInstanceStore = conf.achievementInstanceStore;
    var achvEngines = this.achievementEngines = conf.achievementEngines;

    self.ee = this.ee = new EventEmitter(); // move in conf or global context.

    var initAchievements = function() {
        console.log("initAchievements() gameId: "  +  event.gameId);
        achvStore.getAchievementsForGameId(event.gameId, function callback(error, body, header) {
            if (error) {
                console.log("Not able to get achievements for gameId: " + event.gameId + " Error: " + error);
            } else {
                console.log("getAchievementsForGameId:" + JSON.stringify(body));
                body.rows.forEach(createAchievementInstance);
            }
        });
        self.ee.emitEvent('achievements_initialized', [event]);

        function createAchievementInstance(doc) {
            console.log("createAchievementInstance doc: " +  JSON.stringify(doc));
            var achievementInstance = doc.value;
            achievementInstance.gameId = event.gameId;
            achievementInstance.userId = event.userId;
            achvInstanceStore.createAchievementInstance(achievementInstance, function(error, body) {
                if (error) {
                    console.log("Not able to create achievement instance for doc: " + doc + " Error:" + error);
                }
                else {
                    console.log("Created achievement instance. body:" + JSON.stringify(body));
                }
            });
        }
    };

    var initAchievementEngine = function(event) {
        // console.log("initAchievmentEngine()");
        // load all achievements for user and game
        achvInstanceStore.getAchievementsForGameIdAndUserId(event.gameId, event.userId, function callback(error, body, header) {
            if (error) {
                console.log("Not able to get achievements: " + error);
            } else {
               body.rows.forEach(registerAchievement);
            }
        });


        function registerAchievement(doc) {
            var achvEngine = achvEngines[event.gameId + "_" + event.userId];
            var achievementInstance = doc.value;
            if(achvEngine) {
                achvEngine.registerAchievement(achievementInstance);
            } else {
                achvEngine = new ACHV.AchievementEngine();
                achvEngine.registerAchievement(achievementInstance);
                achvEngines[event.gameId + "_" + event.userId] = achvEngine;
            }
        }
    };

    var eventProcesses = {
        "InitGameEvent" : initAchievements,
        "StartGameEvent" : initAchievementEngine
    };

    var dispatchEvent = function (event, callback) {
        if (typeof eventProcesses[event.name] == 'function') {
            eventProcesses[event.name](event);
        }
        processEvent(event, callback);
    };

    var processEvent = function(event, unlockCallback) {
        achvEngines[event.gameId + "_" + event.userId].processEvent(event, unlockCallback);
    };

    this.ee.addListeners({
        event_triggered: dispatchEvent,
        achievements_initialized: initAchievementEngine
    });
};


ACHV.AchievementSystem.prototype.getAchievementsForGameAndUser = function(gameId, userId) {
    // TODO make key function for gameId and userId
    return this.achievementEngines[gameId+"_"+userId].getAchievements();
};

ACHV.AchievementSystem.prototype.getAchievementEngineForGameAndUser = function(gameId, userId, callback) {
    callback(this.achievementEngines[gameId+"_"+userId]);
};

ACHV.AchievementSystem.prototype.registerGame = function(game) {
    this.game = game;
};

ACHV.AchievementSystem.prototype.isRegistered = function(game) {
    return this.game === game;
};

ACHV.AchievementSystem.prototype.triggerEvent = function(event, notifyUnlockCallback) {
    // console.log("triggerEvent() " + JSON.stringify(event));
    this.ee.emitEvent('event_triggered', [event, notifyUnlockCallback]);
};

ACHV.AchievementSystem.prototype.isAchievementUnlocked = function(gameId, userId, achievement) {
    var isUnlocked = false;
    var achievements = this.achievementEngines[gameId+"_"+userId].getAchievements();
    var index = achievements.indexOf(achievement);
    if (index > -1) {
        var currentAchievement = achievements[index];
        isUnlocked = !currentAchievement.locked;
    }
    return isUnlocked;
};

exports.AchievementSystem = ACHV.AchievementSystem;

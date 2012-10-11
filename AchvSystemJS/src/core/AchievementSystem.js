ACHV.AchievementSystem = function(conf) {
    var self = {};

    var achvStore = conf.achievementStore;
    var achvInstanceStore = conf.achievementInstanceStore;
    this.achievementEngine = conf.achievementEngine;
    var achvEngines = this.achievementEngines = {};

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
            console.log(achvInstanceStore);
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
        console.log("initAchievmentEngine()");
        // load all achievements for user and game
        achvInstanceStore.getAchievementsForGameIdAndUserId(event.gameId, event.userId, function callback(error, body, header) {
            if (error) {
                console.log("Not able to get achievements: " + error);
            } else {
               body.rows.forEach(registerAchievement);
               self.ee.emitEvent('engine_initialized', [event]);
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

    var dispatchEvent = function (event) {
        console.log(JSON.stringify(eventProcesses));
        if (typeof eventProcesses[event.name] == 'function') {
            eventProcesses[event.name](event);
        } else {
            processEvent(event);
        }
    };

    var processEvent = function(event) {
        console.log("processEvent(" + JSON.stringify(event) + ")");
        achvEngines[event.gameId + "_" + event.userId].processEvent(event, unlockCallback);
    };

    var unlockCallback = function(achievements) {
        this.triggerEvent.callBack(achievements);
    };

    this.ee.addListeners({
        event_triggered: dispatchEvent,
        achievements_initialized: initAchievementEngine,
        engine_initialized: processEvent
    });
};

ACHV.AchievementSystem.prototype.setAchievementEngines = function(achievementEngines) {
    this.achievementEngines = achievementEngines;
};


ACHV.AchievementSystem.prototype.registerAchievement = function(achievement) {
    this.achievementEngine.registerAchievement(achievement);
};

ACHV.AchievementSystem.prototype.getAchievements = function() {
    return this.achievementEngine.getAchievements();
};

ACHV.AchievementSystem.prototype.registerGame = function(game) {
    this.game = game;
};

ACHV.AchievementSystem.prototype.isRegistered = function(game) {
    return this.game === game;
};

ACHV.AchievementSystem.prototype.triggerEvent = function(event, notifyUnlockCallback) {
    console.log("triggerEvent() " + JSON.stringify(event));
    this.triggerEvent.callBack = notifyUnlockCallback;
    this.ee.emitEvent('event_triggered', [event]);

    // this.achievementEngine.processEvent(event, notifyUnlockCallback);

        // register engines for achievements

    /*
    var achievementEngine = getAchievementEngine(event);
    achievementEngine.processEvent(event, notifyUnlock());

    function getAchievementEngine(event) {
        var key = event.gameId + "_" + event.userId;
        if (achievementEngines.has(key)) {
            var engine = achievementEngines.get(key);
            engine.processEvent(event, notifyUnlock);
        } else {
            var engine = createAchievementEngine();
            engine.processEvent(event, notifyUnlock);
        }

        function createAchievementEngine() {

        }
    }

    function notifyUnlock(achievement) {
        // TODO notify systems that are interessted, like the assetmanagement.
        notifyUnlockCallback(achievement);
    }
    */
};

ACHV.AchievementSystem.prototype.isAchievementUnlocked = function(achievement) {
    var isUnlocked = false;
    var achievements = this.achievementEngine.getAchievements();
    var index = achievements.indexOf(achievement);
    if (index > -1) {
	var currentAchievement = achievements[index];
	isUnlocked = !currentAchievement.locked;
    }
    return isUnlocked;
};

exports.AchievementSystem = ACHV.AchievementSystem;

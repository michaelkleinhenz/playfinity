ACHV.AchievementSystem = function(conf) {
    this.achievementStore = conf.achievementStore;
    this.achievementInstanceStore = conf.achievementInstanceStore;
    this.achievementEngine = conf.achievementEngine;
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
    var self = {};
    self.achvInstanceStore = this.achievementInstanceStore;

    var eventProcesses = {
        'InitGameEvent': initAchievements(this.achievementStore, createAchievementInstance),
        'StartGameEvent': initAchievementEngine()
    };
    if (typeof eventProcesses[event.name] == 'function') {
        eventProcesses[event.name]();
    }
    this.achievementEngine.processEvent(event, notifyUnlockCallback);

    function initAchievements(achievementStore, createAchievementInstance) {
        console.log("initAchievements - gameId: "  +  event.gameId);
        achievementStore.getAchievementsForGameId(event.gameId, function callback(error, body, header) {
            if (error) {
                console.log("Not able to get achievements for gameId: " + event.gameId + " Error: " + error);
            } else {
                console.log("getAchievementsForGameId:" + JSON.stringify(body));
                body.rows.forEach(createAchievementInstance);
            }
        });
        /*
        loadAllAchivementsForGame <- AchievementStore
        storeAchievementInstancesWithGameIdAndUserId SaveGameId? -> AchievementInstanceStore
        */
    }

    function createAchievementInstance(doc) {
        console.log("createAchievementInstance doc: " +  JSON.stringify(doc));
        var achievementInstance = doc.value;
        achievementInstance.gameId = event.gameId;
        achievementInstance.userId = event.userId;
        console.log(self.achvInstanceStore);
        self.achvInstanceStore.createAchievementInstance(achievementInstance, function(error, body) {
            if (error) {
                console.log("Not able to create achievement instance for doc: " + doc + " Error:" + error);
            }
            else {
                console.log("createAchievementInstance body:" + JSON.stringify(body));
            }
        });
        initAchievementEngine();
    }

    function initAchievementEngine() {
        console.log('initAchievementEngine');
    }

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

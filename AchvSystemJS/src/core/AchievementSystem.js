ACHV.AchievementSystem = function(configuration) {
    this.achievementStore = configuration.achievementStore;
    this.achievementEngine = configuration.achievementEngine;
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
    var eventProcesses = {
    'InitGameEvent': initAchievements(),
    'StartGameEvent': initAchievementEngine()
    };
    if (typeof eventProcesses[event.name] == 'function') {
        eventProcesses[event.name]();
    }
    this.achievementEngine.processEvent(event, notifyUnlockCallback);

    function initAchievements() {
        this.achievementStore.getAchievementsForGameId(event.gameId, function callback(error, body, header) {
            if (error) {
                console.log(error);
            }
            console.log(body);
        });
        /*
        loadAllAchivementsForGame <- AchievementStore
        storeAchievementInstancesWithGameIdAndUserId SaveGameId? -> AchievementInstanceStore
        */
        console.log("initAchievements");
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
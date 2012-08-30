ACHV.AchievementSystem = function(achievementEngine) {
    this.achievementEngine = achievementEngine;
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
    this.achievementEngine.processEvent( event,
	    				 function notifyUnlocked(achievement) {
					// TODO notify systems that are interessted, like the assetmanagement.
					notifyUnlockCallback(achievement);

						console.log(achievement);
					 }
    					);
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
ACHV.OneShotEngine = function() {
    this.achievementType = "OneShotAchievementType";
};

ACHV.OneShotEngine.prototype.process = function(event, achievement, notifyUnlockCallback) {
    var oneShotEvent = achievement.oneShotEvent;
    if(oneShotEvent.name === event.name) {
	achievement.locked = false;
	notifyUnlockCallback(achievement);
    }
};
ACHV.OneShotEngine = function() {
    this.achievementType = "OneShotAchievementType";
};

ACHV.OneShotEngine.prototype.process = function(event, achievement, achievementType) {
    var oneShotEvent = achievement.oneShotEvent;
    if(oneShotEvent.name === event.name) {
	    achievementType.result = "satisfied";
    }
};

exports.OneShotEngine = ACHV.OneShotEngine;

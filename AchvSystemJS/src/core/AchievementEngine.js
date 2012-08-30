ACHV.AchievementEngine = function(engines, achievements) {
    this.engines = engines;
    this.achievements = achievements;
};

ACHV.AchievementEngine.prototype.registerEngine = function(engine) {
    this.engines.set(engine.achievementType, engine);
};

ACHV.AchievementEngine.prototype.getEngineForAchievementType = function(achievementType) {
    return this.engines.get(achievementType);  
};

ACHV.AchievementEngine.prototype.registerAchievement = function(achievement) {
    for ( var i = 0; i < achievement.events.length; i++) {
	var currentEvent = achievement.events[i];
	if (this.achievements.has(currentEvent.name)) {
	    var currentAchievements = this.achievements.get(event.name);
	    currentAchievements.push(achievement);
	    this.achievements.set(currentEvent.name, currentAchievements);
	} else {
	    this.achievements.set(currentEvent.name, [achievement]);
	}
    }
};

ACHV.AchievementEngine.prototype.getAchievements = function() {
    var data = this.achievements._data;
    var allAchievements = [];
    for (var key in data) {
	var currentAchievements = data[key];
	for (var i = 0; i < currentAchievements.length; i++) {
	    var currentAchievement = currentAchievements[i];
	    allAchievements.push(currentAchievement);
	}
    }
    return allAchievements.slice(0);
};

ACHV.AchievementEngine.prototype.getAchievementsForEventType = function(eventType) {
    return this.achievements.get(eventType);  
};

ACHV.AchievementEngine.prototype.processEvent = function(event, notifyUnlockCallback) {
  var fittingAchievements = this.achievements.get(event.name);
  for ( var i = 0; i < fittingAchievements.length; i++) {
    var currentAchievement = fittingAchievements[i];
    var fittingEngine = this.engines.get(currentAchievement.type);
    fittingEngine.process(event, currentAchievement, notifyUnlockCallback);
  }
};

exports.AchievementEngine = ACHV.AchievementEngine;
exports.getAchievements = ACHV.AchievementEngine.prototype.getAchievements;

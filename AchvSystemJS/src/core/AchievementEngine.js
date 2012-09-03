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
	    var currentAchievements = this.achievements.get(currentEvent.name);
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
    var achievements = [];
    if(this.achievements.has(eventType)) {
	achievements = this.achievements.get(eventType);
    }
    return achievements;
};

ACHV.AchievementEngine.prototype.processEvent = function(event, notifyUnlockCallback) {
    var unlockedAchievements = [];
    
    var eventToAchievementsMap = this.achievements;
        
    var fittingAchievements = this.getAchievementsForEventType(event.name);
    
    processAchievements(this.engines, fittingAchievements);
    
    // TODO remove when removing callback style
    if (unlockedAchievements.length > 0) {
	notifyUnlockCallback(unlockedAchievements);
    }
    
    function processAchievements(engines, achievements) {
	for (var i = 0; i < achievements.length; i++) {
	    processAchievement(engines, achievements[i]);
	}
	
	function processAchievement(engines, achievement) {
	    if (engines.has(achievement.type)) {
		var fittingEngine = engines.get(achievement.type);
		fittingEngine.process(event, achievement, unlockAchievement);
	    }
	}
    }
    
    function unlockAchievement(achievement) {
        incFrequencyCounter(achievement);
        resetEventCounters(achievement);
        checkFrequencyReached(achievement);
 	    unlockedAchievements.push(achievement);

        function incFrequencyCounter(achievement) {
            if(achievement.hasOwnProperty("frequencyCounter")) {
                achievement.frequencyCounter = achievement.frequencyCounter + 1;
            }
        }

        function resetEventCounters(achievement) {
            for (var i = 0; i < achievement.events.length; i++) {
                var currentEvent = achievement.events[i];
                if (currentEvent.hasOwnProperty("counter")) {
                 currentEvent.counter = 0;
                }
            }
        }

        function checkFrequencyReached(achievement) {
            if (achievement.frequencyCounter >= achievement.FREQUENCY_COUNTER_MAX) {
                removeAchievement(achievement);
            }

            function removeAchievement(achievement) {
 	            for (var i = 0; i < achievement.events.length; i++) {
        	    	var currentEvent = achievement.events[i];
    	    	    Utils.mapRemoveArrayValue(eventToAchievementsMap, currentEvent.name, achievement);
	            }
            }
        }
    }
};

exports.AchievementEngine = ACHV.AchievementEngine;
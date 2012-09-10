ACHV = {};

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
    for (var j = 0; j < achievement.process.length; j++) {
        registerProcessParts(achievement.process[j], this.achievements);
    }

    function registerProcessParts(processParts, achievements) {
        for (var i = 0; i < processParts.length; i++) {
            registerEvent(processParts[i].event, achievements);
            if (processParts[i].hasOwnProperty("interruptEvent")) {
                registerEvent(processParts[i].interruptEvent, achievements);
            }
        }
    }

    function registerEvent(event, achievements) {
        if (achievements.has(event)) {
            var registeredAchievements = achievements.get(event);
            registeredAchievements.push(achievement);
        } else {
            achievements.set(event, [achievement]);
        }
    }
};

ACHV.AchievementEngine.prototype.getAchievement = function(achievementName) {
    var allAchievements = this.getAchievements();
    for (var i = 0; i < allAchievements.length; i++) {
        if (allAchievements[i].name === achievementName) {
            return allAchievements[i];
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
            processAchievementProcessParts();
            evaluateRuleResults(engines);

            function processAchievementProcessParts() {
                var rules = getActiveRules(achievement);
                for (var i = 0; i < rules.length; i++) {
                    // console.log(achievement.name + ": " + event.name + " --> " + rules[i].event);
                    processAchievementRule(rules[i]);
                }

                function getActiveRules(achievement) {
                    var activeRules = [];
                    for (var i = 0; i < achievement.process.length; i++) {
                        var currentParallelRules = achievement.process[i];
                        for(var j = 0; j < currentParallelRules.length; j++) {
                            if (currentParallelRules[j].state != 'satisfied') {
                                activeRules.push(currentParallelRules[j]);
                                break;
                            }
                        }
                    }
                    return activeRules;
                }
            }

            function processAchievementRule(rule) {
                if (engines.has(rule.type)) {
                    var fittingRuleEvaluator = engines.get(rule.type);
                    fittingRuleEvaluator.process(event, achievement, rule);
                }
            }

            function evaluateRuleResults(engines) {
                var isAchieved = true;
                var rules = getRules(achievement);
                for (var i=0; i < rules.length; i++) {
                    if (!evaluateRule(rules[i])) {
                        isAchieved = false;
                        break;
                    }
                }
                if (isAchieved) {
                    unlockAchievement(engines, achievement);
                }

                function evaluateRule(rule) {
                    if (rule.hasOwnProperty("negation")) {
                        if (rule.negation) {
                            if (rule.state === "satisfied") {
                                resetAchievement(achievement);
                                return false;
                            } else if (rule.state === "inProgress") {
                                return false;
                            }
                        }
                    } else {
                        if (rule.state === "broken") {
                            resetAchievement(achievement);
                            return false;
                        } else if (rule.state === "inProgress") {
                            return false;
                        }
                    }
                    return true;
                }
            }

            function resetAchievement(achievement) {
                var rules = getRules(achievement);
                for (var i = 0; i < rules.length; i++) {
                    var engine = engines.get(rules[i].type);
                    engine.reset(rules[i]);
                }
            }

        }
    }

    function unlockAchievement(engines, achievement) {
        incFrequencyCounter(achievement);
        if (isFrequencyReached(achievement)) {
            removeAchievement(achievement);
        } else {
            resetAchievementState(achievement);
        }
        achievement.locked = false; // TODO remove this property
        unlockedAchievements.push(achievement);

        function incFrequencyCounter(achievement) {
            if(achievement.hasOwnProperty("frequencyCounter")) {
                achievement.frequencyCounter = achievement.frequencyCounter + 1;
            }
        }

        function resetAchievementState(achievement) {
            var rules = getRules(achievement);
            for (var i = 0; i < rules.length; i++) {
                var engine = engines.get(rules[i].type);
                engine.reset(rules[i]);
            }
        }

        function isFrequencyReached(achievement) {
            if (achievement.hasOwnProperty("FREQUENCY_COUNTER_MAX")) {
                return achievement.frequencyCounter >= achievement.FREQUENCY_COUNTER_MAX;
            } else {
                return false;
            }
        }

        function removeAchievement(achievement) {
            var rules = getRules(achievement);
            for (var i = 0; i < rules.length; i++) {
                var currentEvent = rules[i].event;
    	        Utils.mapRemoveArrayValue(eventToAchievementsMap, currentEvent, achievement);
	        }
        }
    }

    function getRules(achievement) {
        var rules = [];
        for (var i = 0; i < achievement.process.length; i++) {
            for (var j = 0; j < achievement.process[i].length; j++) {
                var tmpRuleSet = achievement.process[i];
                var currentRule = tmpRuleSet[j];
                rules.push(currentRule);
            }
        }
        return rules;
    }

};

exports.AchievementEngine = ACHV.AchievementEngine;
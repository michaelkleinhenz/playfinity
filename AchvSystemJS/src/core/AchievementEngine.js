var ACHV = {};

ACHV.AchievementEngine = function () {
    this.ruleEnginesMap = {};
    this.achievementsMap = {};
    // TODO move engines in configuration
    this.engines = {
        "OneShotRule": new ACHV.OneShotEngine,
        "CounterRule": new ACHV.CounterEngine,
        "TimerRule": ACHV.timerEngine({"achievementType": "TimerRule"}),
        "StopWatchRule": ACHV.stopWatchEngine({"achievementType": "StopWatchRule"})
    };
};

ACHV.AchievementEngine.prototype.registerEngine = function(engine) {
    this.ruleEnginesMap[engine.achievementType] = engine;
};

ACHV.AchievementEngine.prototype.getEngineForAchievementType = function(achievementType) {
    return this.ruleEnginesMap[achievementType];
};

ACHV.AchievementEngine.prototype.registerAchievement = function(achievement) {
    var that = {};
    that.ruleEnginesMap = this.ruleEnginesMap;
    that.engines = this.engines;
    that.registerEngine = this.registerEngine;

    for (var j = 0; j < achievement.process.length; j++) {
        registerProcessParts(achievement.process[j], this.achievementsMap);
    }

    function registerProcessParts(processParts, achievementsMap) {
        for (var i = 0; i < processParts.length; i++) {
            registerEngineForRuleType(processParts[i].type);

            registerEvent(processParts[i].event, achievementsMap);
            if (processParts[i].hasOwnProperty("interruptEvent")) {
                registerEvent(processParts[i].interruptEvent, achievementsMap);
            }
            if (processParts[i].hasOwnProperty("events")) {
                for(var k = 0; k < processParts[i].events.length; k++) {
                    registerEvent(processParts[i].events[k], achievementsMap);
                }
            }
        }
    }

    function registerEngineForRuleType(ruleType) {
        if (!that.ruleEnginesMap[ruleType]) {
            var engine = that.engines[ruleType];
            that.registerEngine(engine);
        }
    }

    function registerEvent(event, achievementsMap) {
        if (achievementsMap[event]) {
            var registeredAchievements = achievementsMap[event];
            if (!Utils.arrayContains(registeredAchievements, achievement)) {
                registeredAchievements.push(achievement);
            }
        } else {
            achievementsMap[event]= [achievement];
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
    var allAchievements = [];
    for (var key in this.achievementsMap) {
        var currentAchievements = this.achievementsMap[key];
        for (var i = 0; i < currentAchievements.length; i++) {
            var currentAchievement = currentAchievements[i];
            allAchievements.push(currentAchievement);
        }
    }
    return allAchievements.slice(0);
};

ACHV.AchievementEngine.prototype.getAchievementsForEventType = function(eventType) {
    var achievements = [];
    if(this.achievementsMap[eventType]) {
        achievements = this.achievementsMap[eventType];
    }
    return achievements;
};

ACHV.AchievementEngine.prototype.processEvent = function(event, notifyUnlockCallback) {
    "use strict";
    // console.log("processEvent(event) - " + JSON.stringify(event));
    var unlockedAchievements = [];
    var eventToAchievementsMap = this.achievementsMap;
    var fittingAchievements = this.getAchievementsForEventType(event.name);
    var hasToRetriggerEvent = false;

    processAchievements(this.ruleEnginesMap, fittingAchievements);

    if (hasToRetriggerEvent) {
       processAchievements(this.ruleEnginesMap, fittingAchievements);
       hasToRetriggerEvent = false;
    }

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
                    processAchievementRule(rules[i]);
                }

                function getActiveRules(achievement) {
                    var activeRules = [];
                    for (var i = 0; i < achievement.process.length; i++) {
                        var currentParallelRules = achievement.process[i];
                        for(var j = 0; j < currentParallelRules.length; j++) {
                            activeRules.push(currentParallelRules[j]);
                            if (currentParallelRules[j].state !== 'satisfied') {
                                break;
                            }
                        }
                    }
                    return activeRules;
                }
            }

            function processAchievementRule(rule) {
               if (engines[rule.type]) {
                    var fittingRuleEvaluator = engines[rule.type];
                    fittingRuleEvaluator.process(event, rule, function achvValueChanged(isChanged) {
                        if (isChanged) {
                            // emit achievementinstance changed event.
                        }
                    });
                }
            }

            function evaluateRuleResults(engines) {
                var ruleResults = [];
                var rules = getRules(achievement);
                for (var i=0; i < rules.length; i++) {
                        ruleResults.push(evaluateRule(rules[i]));
                }

                if (!Utils.arrayContains(ruleResults, false)) {
                    unlockAchievement(engines, achievement);
                }

                function evaluateRule(rule) {
                    if (rule.state === "broken") {
                        resetAchievement(achievement);
                        hasToRetriggerEvent = true;
                        return false;
                    } else if (rule.state === "inProgress") {
                        return false;
                    }
                    return true;
                }
            }

            function resetAchievement(achievement) {
                var rules = getRules(achievement);
                for (var i = 0; i < rules.length; i++) {
                    var engine = engines[rules[i].type];
                    engine.reset(rules[i]);
                }
            }
        }

    }

    function unlockAchievement(engines, achievement) {
        incFrequencyCounter(achievement);
        if (isFrequencyReached(achievement)) {
            removeAchievement(eventToAchievementsMap, achievement);
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
                var engine = engines[rules[i].type];
                engine.reset(event, achievement, rules[i]);
            }
        }

        function isFrequencyReached(achievement) {
            if (achievement.hasOwnProperty("FREQUENCY_COUNTER_MAX")) {
                return achievement.frequencyCounter >= achievement.FREQUENCY_COUNTER_MAX;
            } else {
                return false;
            }
        }

        function removeAchievement(achievementsMap, achievement) {
            var rules = getRules(achievement);
            for (var i = 0; i < rules.length; i++) {
                var currentEvent = rules[i].event;
                var achievementArray = achievementsMap[currentEvent];
                var indexAchievement = achievementArray.indexOf(achievement);
                if (indexAchievement !== - 1) {
                    achievementArray.splice(indexAchievement, 1);
                }
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
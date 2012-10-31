/*global ACHV, Utils, async*/
ACHV.AchievementEngine = function (conf) {
    this.eventBus = conf.eventBus;
    this.engines = conf.engines;
    this.achvProcessor = ACHV.achievementProcessor();
    this.ruleEnginesMap = {};
    this.achievementsMap = {};
    // TODO move engines in configuration
    this.engines = {
        "TimerRule": ACHV.timerEngine({"achievementType": "TimerRule"}),
        "OneShotRule": new ACHV.OneShotEngine(),
        "CounterRule": new ACHV.CounterEngine(),
        "StopWatchRule": ACHV.stopWatchEngine({"achievementType": "StopWatchRule"})
    };
};

ACHV.AchievementEngine.prototype.registerEngine = function (engine) {
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
    var eventBus = this.eventBus,
        achvProcessor = this.achvProcessor,
        engines = this.engines,
        retryCounter = 0;
    var unlockedAchievements = [];
    var eventToAchievementsMap = this.achievementsMap;
    var fittingAchievements = this.getAchievementsForEventType(event.name);

    async.series(
        {
            one: function (callback) {
                processAchievements(engines, fittingAchievements, callback);
            }
        },
        function (error, result) {
           notifyUnlockCallback(unlockedAchievements);
        }
    );

    function processAchievements(engines, achievements, callback) {
        for (var i = 0; i < achievements.length; i++) {
            achvProcessor.process(achievements[i], engines, event, processAchievementsCallback);
        }
        callback(null, null);

        function processAchievementsCallback(error, processAchievementsResult) {
            if(processAchievementsResult.hasToRetriggerEvent && retryCounter < 1) {
                retryCounter++;
                eventBus.emitEvent('achv_value_changed', [processAchievementsResult.achievement]);
                achvProcessor.process(processAchievementsResult.achievement, engines, event, processAchievementsCallback);
            } else {
                async.series(
                    {
                        isAchievementRemoved: function(callback) {
                            if (processAchievementsResult.isUnlocked) {
                                unlockAchievement(engines, processAchievementsResult.achievement, callback);
                            } else {
                                callback(null, false);
                            }
                        }
                    },
                    function(error, results) {
                        if (results.isAchievementRemoved) {
                            eventBus.emitEvent('achv_removed',
                                [
                                    processAchievementsResult.achievement.name,
                                    processAchievementsResult.achievement._rev,
                                    function(error, result){}
                                ]
                            );
                        } else if (processAchievementsResult.isValueChanged) {
                            eventBus.emitEvent('achv_value_changed', [processAchievementsResult.achievement]);
                        }
                    }
                );
            }
        }
    }

    function unlockAchievement(engines, achievement, callback) {
        var isRemoved = false;
        incFrequencyCounter(achievement);
        if (isFrequencyReached(achievement)) {
            removeAchievement(eventToAchievementsMap, achievement);
            isRemoved = true;
        } else {
            resetAchievementState(achievement);
        }
        achievement.locked = false; // TODO remove this property
        unlockedAchievements.push(achievement);
        callback(null, isRemoved);

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
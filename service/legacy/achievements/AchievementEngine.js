/*
 * Playfinity
 * Questor Achievement System
 *
 * Copyright (c) 2013 Questor GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * Head processing class for event handling. Uses AchievementProcessor for
 * further processing of an event.
 */

ACHV.AchievementEngine = function (conf) {
    "use strict";
    this.eventBus = conf.eventBus;
    this.engines = conf.engines;
    this.achvProcessor = ACHV.achievementProcessor();
    this.ruleEnginesMap = {};
    this.achievementsMap = {};
    //TODO move engines in configuration
    this.engines = {
        "TimerRule": ACHV.timerEngine({"achievementType": "TimerRule"}),
        "OneShotRule": ACHV.oneShotEngine({"achievementType": "OneShotRule"}),
        "CounterRule": ACHV.counterEngine({"achievementType": "CounterRule"}),
        "StopWatchRule": ACHV.stopWatchEngine({"achievementType": "StopWatchRule"})
    };
};

ACHV.AchievementEngine.prototype.registerEngine = function (engine) {
    this.ruleEnginesMap[engine.achievementType] = engine;
};

ACHV.AchievementEngine.prototype.getEngineForAchievementType = function (achievementType) {
    return this.ruleEnginesMap[achievementType];
};

ACHV.AchievementEngine.prototype.registerAchievement = function (achievement) {
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

            if (processParts[i].hasOwnProperty("event")) {
                registerEvent(processParts[i].event, achievementsMap);
            }
            if (processParts[i].hasOwnProperty("startEvent")) {
                registerEvent(processParts[i].startEvent, achievementsMap);
            }
            if (processParts[i].hasOwnProperty("stopEvent")) {
                 registerEvent(processParts[i].stopEvent, achievementsMap);
            }
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
        for (var property in allAchievements[i].name) {
            var thisName = allAchievements[i].name[property];
            if (thisName === achievementName)
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
    var eventBus = this.eventBus,
        achvProcessor = this.achvProcessor,
        engines = this.engines,
        retryCounter = 0;
    var unlockedAchievements = [];
    var eventToAchievementsMap = this.achievementsMap;
    var fittingAchievements = this.getAchievementsForEventType(event.eventId);
    //console.log("AchievementEngine.processEvent() - event.eventId=" + event.eventId +  ", fittingAchievements=" + JSON.stringify(fittingAchievements) );
    Async.series(
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
            //console.log("AchievementEngine.processAchievementsCallback() - processAchievementsResult=" + JSON.stringify(processAchievementsResult));
            if(processAchievementsResult.hasToRetriggerEvent && retryCounter < 1) {
                retryCounter++;
                eventBus.emitEvent('achv_value_changed', [processAchievementsResult.achievement]);
                achvProcessor.process(processAchievementsResult.achievement, engines, event, processAchievementsCallback);
            } else {
                Async.series(
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
                            /* TODO Temporaly until unlock achievements will be moved cabinet db.
                            eventBus.emitEvent('achv_removed',
                                [
                                    processAchievementsResult.achievement._id,
                                    processAchievementsResult.achievement._rev,
                                    function(error, result){}
                                ]
                            );
                        } else if (processAchievementsResult.isValueChanged) {
                            eventBus.emitEvent('achv_value_changed', [processAchievementsResult.achievement]);
                        }
                         */
                            if (processAchievementsResult.isValueChanged) {
                                eventBus.emitEvent('achv_value_changed', [processAchievementsResult.achievement]);
                            }
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
            if (achievement.hasOwnProperty("frequencyCounterMax")) {
                return achievement.frequencyCounter >= achievement.frequencyCounterMax;
            } else {
                return false;
            }
        }

        function removeAchievement(achievementsMap, achievement) {
            var rules = getRules(achievement);
            for (var i = 0; i < rules.length; i++) {
                if(rules[i].hasOwnProperty("startEvent") && rules[i].hasOwnProperty("stopEvent")) {
                    var startEvent = rules[i].startEvent;
                    var stopEvent = rules[i].stopEvent;
                    var startAchvArray = achievementsMap[startEvent];
                    var indexStart = startAchvArray.indexOf(achievement);
                    if (indexStart !== -1) {
                        startAchvArray.splice(indexStart, 1);
                    }

                    var stopAchvArray = achievementsMap[stopEvent];
                    var indexStop = stopAchvArray.indexOf(achievement);
                    if (indexStop !== -1) {
                        stopAchvArray.splice(indexStop, 1);
                    }

                } else {
                    var currentEvent = rules[i].event;
                    var achievementArray = achievementsMap[currentEvent];
                    if (!(achievementArray===undefined)) {
                        var indexAchievement = achievementArray.indexOf(achievement);
                        if (indexAchievement !== - 1) {
                            achievementArray.splice(indexAchievement, 1);
                        }
                    }
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
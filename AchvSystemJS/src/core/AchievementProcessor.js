/*global ACHV, Utils, async*/
(function () {
    "use strict";
    ACHV.achievementProcessor = function () {
        var self = {};

        self.process = function (achievement, engines, event, next) {
            async.series(
                {
                    one: function (callback) {
                        processAchievementProcessParts(achievement, engines, event, callback);
                    },
                    two: function (callback) {
                        evaluateRuleResults(achievement, engines, callback);
                    }
                },
                function (error, results) {
                    next(error,
                        {
                            "isValueChanged": results.one || results.two.isValueChanged,
                            "isUnlocked" : results.two.isUnlocked,
                            "hasToRetriggerEvent": results.two.hasToRetriggerEvent,
                            "achievement": achievement
                        });
                }
            );
        };

        function processAchievementProcessParts(achievement, engines, event, callback) {
            var valueChanged = [],
                rules = getActiveRules(achievement);

            for (var i = 0; i < rules.length; i++) {
                valueChanged.push(processAchievementRule(engines, event, rules[i]));
            }

            callback(null, Utils.arrayContains(valueChanged, true));

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

            function processAchievementRule(engines, event, rule) {
                var valueChanged = false;
                if (engines[rule.type]) {
                    var fittingRuleEvaluator = engines[rule.type];
                    fittingRuleEvaluator.process(event, rule, function achvValueChanged(isChanged) {
                        if (isChanged) {
                            valueChanged = true;
                        }
                    });
                }
                return valueChanged;
            }
        }

        function evaluateRuleResults(achievement, engines, callback) {
            var isAchievementUnlocked = false,
                isValueChanged = false,
                hasToRetriggerEvent = false,
                ruleResults = [],
                rules = getRules(achievement);

            for (var i=0; i < rules.length; i++) {
                ruleResults.push(evaluateRule(rules[i]));
            }

            if (!Utils.arrayContains(ruleResults, false)) {
                isAchievementUnlocked = true;
            }
            callback(null, {
                    "isUnlocked": isAchievementUnlocked,
                    "hasToRetriggerEvent": hasToRetriggerEvent,
                    "isValueChanged": isValueChanged
                }
            );

            function evaluateRule(rule) {
                if (rule.state === "broken") {
                    resetAchievement(achievement);
                    hasToRetriggerEvent = true;
                    isValueChanged = true;
                    return false;
                } else if (rule.state === "inProgress") {
                    return false;
                }
                return true;

                function resetAchievement(achievement) {
                    var rules = getRules(achievement);
                    for (var i = 0; i < rules.length; i++) {
                        var engine = engines[rules[i].type];
                        engine.reset(rules[i]);
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
        }

        return self;
    };

}());
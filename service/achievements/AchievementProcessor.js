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
 * Event handling and rules execution.
 */

(function () {
    "use strict";

    ACHV.achievementProcessor = function () {
        var self = {};

        self.process = function (achievement, engines, event, next) {
            Async.series(
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

                function resetAchievement(achievement) {
                    var rules = getRules(achievement);
                    for (var i = 0; i < rules.length; i++) {
                        var engine = engines[rules[i].type];
                        engine.reset(rules[i]);
                    }
                }

                if(!rule.state) {
                    rule.state = "inProgress";
                }

                if (rule.state === "broken") {
                    resetAchievement(achievement);
                    hasToRetriggerEvent = true;
                    isValueChanged = true;
                    return false;
                } else if (rule.state === "inProgress") {
                    return false;
                }

                return true;
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
ACHV.achievementWrapper = function(achievement) {

    achievement.getRules = function() {
        var rules = [];
        for (var i = 0; i < achievement.process.length; i++) {
            for (var j = 0; j < achievement.process[i].length; j++) {
                var tmpRuleSet = achievement.process[i];
                var currentRule = tmpRuleSet[j];
                rules.push(currentRule);
            }
        }
        return rules;
    };

    return achievement;
};
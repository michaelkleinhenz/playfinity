/*global ACHV*/
ACHV.OneShotEngine = function () {
    this.achievementType = "OneShotRule";
};

ACHV.OneShotEngine.prototype.process = function (event, rule, valueChanged) {
    if (rule.event === event.name) {
        rule.state = "satisfied";
        valueChanged(true);
    }
};

ACHV.OneShotEngine.prototype.reset = function(rule) {
    rule.state = "inProgress";
};

exports.OneShotEngine = ACHV.OneShotEngine;

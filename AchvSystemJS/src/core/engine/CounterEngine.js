/*global ACHV*/
ACHV.CounterEngine = function() {
    this.achievementType = 'CounterRule';
};

ACHV.CounterEngine.prototype.process = function (event, rule, valueChanged) {
    var isChanged = false;
    if (event.name === rule.interruptEvent) {
        rule.counter = 0;
        rule.state = "inProgress";
        isChanged = true;
    } else if (rule.event === event.name) {
        rule.counter++;
        if (rule.counter >= rule.COUNTER_MAX) {
            rule.state = "satisfied";
        }
        isChanged = true;
    }
    valueChanged(isChanged);
};

ACHV.CounterEngine.prototype.reset = function (rule) {
    rule.counter = 0;
    rule.state = "inProgress";
};

exports.CounterEngine = ACHV.CounterEngine;

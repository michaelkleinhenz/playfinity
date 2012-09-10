ACHV.CounterEngine = function() {
    this.achievementType = 'CounterRule';
};

ACHV.CounterEngine.prototype.process = function(event, achievement, rule) {
    rule.counter++;
    if (rule.counter >= rule.COUNTER_MAX) {
        rule.state = "satisfied";
    }
};

ACHV.CounterEngine.prototype.reset = function(rule) {
    rule.counter = 0;
    rule.state = "inProgress";
};

exports.CounterEngine = ACHV.CounterEngine;

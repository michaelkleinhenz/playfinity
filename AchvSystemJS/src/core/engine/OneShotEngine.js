ACHV.OneShotEngine = function() {
    this.achievementType = "OneShotRule";
};

ACHV.OneShotEngine.prototype.process = function(event, achievement, rule) {
    if(rule.event === event.name) {
	    rule.state = "satisfied";
    }
};

ACHV.OneShotEngine.prototype.reset = function(event, achievement, rule) {
    rule.state = "inProgress";
};

exports.OneShotEngine = ACHV.OneShotEngine;

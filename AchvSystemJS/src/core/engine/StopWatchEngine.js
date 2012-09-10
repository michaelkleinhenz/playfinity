ACHV.stopWatchEngine = function(spec) {
    var that = ACHV.timerEngine(spec);

    that.process = function(event, achievement, rule) {
        if (event.name === rule.startEvent) {
            that.processStartEvent(event, rule);
        }
        if (event.name = rule.stopEvent) {
            that.processCurrentEvent(event, rule);
        }
    };

    return that;
};

exports.timerEngine = ACHV.timerEngine;
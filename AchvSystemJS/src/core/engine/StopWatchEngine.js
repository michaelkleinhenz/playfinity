ACHV.stopWatchEngine = function(spec) {
    var that = ACHV.timerEngine(spec);

    that.process = function(event, rule, valueChanged) {
        if (event.name === rule.startEvent) {
            that.processStartEvent(event, rule);
        }
        if (event.name = rule.stopEvent) {
            that.processCurrentEvent(event, rule);
        }
    };

    return that;
};

exports.stopWatchEngine = ACHV.stopWatchEngine;
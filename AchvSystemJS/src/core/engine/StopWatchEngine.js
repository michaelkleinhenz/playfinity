/*global ACHV*/
ACHV.stopWatchEngine = function (spec) {
    "use strict";
    var that = ACHV.timerEngine(spec);

    that.process = function (event, rule, valueChanged) {
        console.log("StopWatchEngine.process");
        if (event.name === rule.startEvent) {
            that.processStartEvent(event, rule);
        }
        if (event.name === rule.stopEvent) {
            that.processCurrentEvent(event, rule);
        }
        valueChanged(that.stateChanged.getValue());
    };

    return that;
};

exports.stopWatchEngine = ACHV.stopWatchEngine;
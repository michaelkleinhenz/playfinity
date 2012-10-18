/*global ACHV, Utils*/
ACHV.timerEngine = function (spec) {
    "use strict";
    var that = ACHV.engine(spec);

    that.stateChanged = function () {
        var changed = false;
        return {
            setChanged: function (isChanged) {
                changed = isChanged;
            },
            getValue: function () {
                return changed;
            }
        };
    }();

    that.process = function (event, rule, valueChanged) {
        that.processStartEvent(event, rule);
        that.processCurrentEvent(event, rule);
        valueChanged(that.stateChanged.getValue());
    };

    that.processStartEvent = function (event, rule) {
        function setTimeProperties() {
            if (event.hasOwnProperty("tsInit") && !rule.hasOwnProperty("startTime")) {
                rule.startTime = event.tsInit;
                rule.state = "satisfied";
                that.stateChanged.setChanged(true);
            }
        }
        if (rule.hasOwnProperty("startTimerEvents")) {
            if (Utils.arrayContains(rule.startTimerEvents, event.name)) {
                setTimeProperties();
            }
        } else {
            setTimeProperties();
        }
    };

    that.processCurrentEvent = function (event, rule) {
        if (event.hasOwnProperty("tsInit")) {
            rule.lastEventTime = event.tsInit;
            rule.timer = rule.lastEventTime - rule.startTime;
            if (rule.timer <= rule.TIMER_MAX_SEC) {
                rule.state = "satisfied";
            } else {
                rule.state = "broken";
            }
            that.stateChanged.setChanged(true);
        }
    };

    that.reset = function (rule) {
        rule.timer = 0;
        rule.state = "inProgress";
        delete rule.startTime;
    };

    return that;
};

exports.timerEngine = ACHV.timerEngine;
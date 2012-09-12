ACHV.timerEngine = function(spec) {
    var that = ACHV.engine(spec);

    that.process = function(event, achievement, rule) {
        that.processStartEvent(event, rule);
        that.processCurrentEvent(event, rule);
    };

    that.processStartEvent = function(event, rule) {
        if (rule.hasOwnProperty("startTimerEvents")) {
            if (Utils.arrayContains(rule.startTimerEvents, event.name)) {
                setTimeProperties();
            }
        } else {
            setTimeProperties();
        }

        function setTimeProperties() {
            if(event.hasOwnProperty("tsInit") && !rule.hasOwnProperty("startTime")) {
                rule.startTime = event.tsInit;
                rule.state = "satisfied";
            }
        }
    };

    that.processCurrentEvent = function(event, rule) {
        if(event.hasOwnProperty("tsInit")) {
            rule.lastEventTime = event.tsInit;
            rule.timer = rule.lastEventTime - rule.startTime;
            if (rule.timer <= rule.TIMER_MAX_SEC) {
                rule.state = "satisfied";
            } else {
               rule.state = "broken";
            }
        }
    };

    that.reset = function(rule) {
        rule.timer = 0;
        rule.state = "inProgress";
        delete rule.startTime;
    };

    return that;
};

exports.timerEngine = ACHV.timerEngine;
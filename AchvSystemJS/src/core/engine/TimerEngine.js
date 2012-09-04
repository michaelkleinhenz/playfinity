var timerEngine = function(spec) {
    var that = engine(spec);

    that.process = function(event, achievement, notifyUnlockCallback) {
        processStartEvent(event);
        processStopEvent(event);

        function processStartEvent(event) {
           if(event.hasOwnProperty("startTsInit")) {
               achievement.startTime = event.startTsInit;
           }
        }

        function processStopEvent(event) {
            if(event.hasOwnProperty("stopTsInit")) {
                achievement.stopTime = event.stopTsInit;
                achievement.timer = achievement.stopTime - achievement.startTime;
                if (achievement.timer >= achievement.TIMER_MAX_SEC) {
                    that.unlockAchievement(achievement, notifyUnlockCallback);
                }
            }
        }
    };

    return that;
};

exports.timerEngine = timerEngine;
ACHV.timerEngine = function(spec) {
    var that = ACHV.engine(spec);

    that.process = function(event, achievement, achievementType) {
        var result = "stillSatisfiable";
        processStartEvent(event);
        processCurrentEvent(event);

        function processStartEvent(event) {
           if(event.hasOwnProperty("tsInit") && !achievement.hasOwnProperty("startTime")) {
               achievement.startTime = event.tsInit;
           }
        }

        function processCurrentEvent(event) {
            if(event.hasOwnProperty("tsInit")) {
                achievement.lastEventTime = event.tsInit;
                achievement.timer = achievement.lastEventTime - achievement.startTime;
                if (achievement.timer <= achievement.TIMER_MAX_SEC) {
                        achievementType.result = "satisfied";
                } else {
                        achievementType.result = "broken";
                }
            }
        }
    };

    return that;
};

exports.timerEngine = ACHV.timerEngine;
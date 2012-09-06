ACHV.CounterEngine = function() {
    this.achievementType = 'CounterAchievementType';
};

ACHV.CounterEngine.prototype.process = function(event, achievement, achievementType) {
    for (var i = 0; i < achievement.events.length; i++) {
        var currentEvent = achievement.events[i];
        if (currentEvent.counter >= currentEvent.COUNTER_MAX) {
            continue;
        }
        if (currentEvent.name === event.name) {
            currentEvent.counter = currentEvent.counter + 1;
            if(currentEvent.counter >= currentEvent.COUNTER_MAX) {
                achievement.unlockCounter = achievement.unlockCounter + 1;
                if(achievement.unlockCounter >= achievement.UNLOCK_COUNTER_MAX) {
                    achievementType.result = "satisfied";
                }
            }
        }
    }
};

exports.CounterEngine = ACHV.CounterEngine;

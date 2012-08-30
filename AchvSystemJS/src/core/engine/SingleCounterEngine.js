ACHV.SingleCounterEngine = function() {};

ACHV.SingleCounterEngine.prototype.process = function(event, achievement, notifyUnlockCallback) {
    var singleCounterEvent = achievement.singleCounterEvent;
    if(singleCounterEvent.name === event.name) {
	achievement.counter = achievement.counter + 1;
	if (achievement.counter >= achievement.COUNTER_MAX) {
	    achievement.locked = false;
	    notifyUnlockCallback(achievement);    
	}
    }
};
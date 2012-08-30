TestCase("SingleCounterEngineTest", {
    
    testProcessToUnlockEvent: function() {
	var isLocked = true;
	var engine = new ACHV.SingleCounterEngine();
	var event = FIXTURE.getHeadShotEvent();
	var achievement = FIXTURE.getTenHeadShotsAchievement();
	var callback = function(unlockedAchievement) {
	    isLocked = achievement.locked;
	};
	for (var i = 0; i < 10; i++) {
	    engine.process(event, achievement, callback);
	}
	assertFalse(isLocked);
    },
    
    testProcessStillLocked: function() {
	var isLocked = true;
	var engine = new ACHV.SingleCounterEngine();
	var event = FIXTURE.getHeadShotEvent();
	var achievement = FIXTURE.getTenHeadShotsAchievement();
	var callback = function(unlockedAchievement) {
	    isLocked = achievement.locked;
	};
	engine.process(event, achievement, callback);
	assertTrue(isLocked);
    }
});
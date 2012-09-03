TestCase("CounterEngineTest", {

    testProcessToUnlockEvent: function() {
    	var isLocked = true;
	    var engine = new ACHV.CounterEngine();
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

    testProcessStillLockedSingleCounter: function() {
    	var isLocked = true;
	    var engine = new ACHV.CounterEngine();
	    var event = FIXTURE.getHeadShotEvent();
	    var achievement = FIXTURE.getTenHeadShotsAchievement();
	    var callback = function(unlockedAchievement) {
	        isLocked = achievement.locked;
	    };
	    engine.process(event, achievement, callback);
	    assertTrue(isLocked);
    },

    testProcessToUnlockEventAlternate: function () {
	var isLocked = true;
	var engine = new ACHV.CounterEngine();
	var headShotEvent = FIXTURE.getHeadShotEvent();
	var kneeShotEvent = FIXTURE.getKneeShotEvent();
	var achievement = FIXTURE.getTenHeadAndKneeShotsAchievement();
	var callback = function(unlockedAchievement) {
	    isLocked = achievement.locked;
	};
	for (var i = 0; i < 10; i++) {
	    engine.process(headShotEvent, achievement, callback);
	    engine.process(kneeShotEvent, achievement, callback);
	}
	assertFalse(isLocked);
    },
    
    testProcessToUnlockEventInRow: function () {
	var isLocked = true;
	var engine = new ACHV.CounterEngine();
	var headShotEvent = FIXTURE.getHeadShotEvent();
	var kneeShotEvent = FIXTURE.getKneeShotEvent();
	var achievement = FIXTURE.getTenHeadAndKneeShotsAchievement();
	var callback = function(unlockedAchievement) {
	    isLocked = achievement.locked;
	};
	for (var i = 0; i < 10; i++) {
	    engine.process(headShotEvent, achievement, callback);
	}
	for (var i = 0; i < 10; i++) {
	    engine.process(kneeShotEvent, achievement, callback);
	}    
	assertFalse(isLocked);
    },
    
    testProcessStillLocked: function() {
	var isLocked = true;
	var engine = new ACHV.CounterEngine();
	var kneeShotEvent = FIXTURE.getKneeShotEvent();
	var achievement = FIXTURE.getTenHeadAndKneeShotsAchievement();
	var callback = function(unlockedAchievement) {
	    isLocked = achievement.locked;
	};
	for (var i = 0; i < 10; i++) {
	    engine.process(kneeShotEvent, achievement, callback);
	}
	assertTrue(isLocked);
    }
});
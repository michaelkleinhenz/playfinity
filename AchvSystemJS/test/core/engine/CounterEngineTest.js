TestCase("CounterEngineTest", {

    testProcessToUnlockEvent: function() {
    	var isLocked = true;
	    var engine = new ACHV.CounterEngine();
    	var event = FIXTURE.getHeadShotEvent();
    	var achievement = FIXTURE.getTenHeadShotsAchievement();
        var achievementType = achievement.types[0];
    	for (var i = 0; i < 10; i++) {
	        engine.process(event, achievement, achievement.types[0]);
    	}
	    assertEquals("satisfied", achievementType.result);
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
        var achievementType = achievement.types[0];
        for (var i = 0; i < 10; i++) {
            engine.process(headShotEvent, achievement, achievementType);
            engine.process(kneeShotEvent, achievement, achievementType);
        }
        assertEquals("satisfied", achievementType.result);
    },

    testProcessToUnlockEventInRow: function () {
        var isLocked = true;
        var engine = new ACHV.CounterEngine();
        var headShotEvent = FIXTURE.getHeadShotEvent();
        var kneeShotEvent = FIXTURE.getKneeShotEvent();
        var achievement = FIXTURE.getTenHeadAndKneeShotsAchievement();
        var achievementType = achievement.types[0];
        for (var i = 0; i < 10; i++) {
            engine.process(headShotEvent, achievement, achievementType);
        }
        for (var i = 0; i < 10; i++) {
            engine.process(kneeShotEvent, achievement, achievementType);
        }
        assertEquals("satisfied", achievementType.result);
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
TestCase("CounterEngineTest", {

    testProcessToUnlockEvent: function() {
    	var isLocked = true;
	    var engine = new ACHV.CounterEngine();
    	var event = FIXTURE.getHeadShotEvent();
    	var achievement = FIXTURE.getTenHeadShotsAchievement();
        achievement = ACHV.achievementWrapper(achievement);
        var rules = achievement.getRules();
        for (var i = 0; i < 10; i++) {
	        engine.process(event, achievement, rules[0]);
    	}
	    assertEquals("satisfied", rules[0].state);
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
        achievement = ACHV.achievementWrapper(achievement);
        var rules = achievement.getRules();
        for (var i = 0; i < 10; i++) {
            engine.process(headShotEvent, achievement, rules[0]);
            engine.process(kneeShotEvent, achievement, rules[1]);
        }
        assertEquals("satisfied", rules[0].state);
        assertEquals("satisfied", rules[1].state);
    },

    testProcessToUnlockEventInRow: function () {
        var isLocked = true;
        var engine = new ACHV.CounterEngine();
        var headShotEvent = FIXTURE.getHeadShotEvent();
        var kneeShotEvent = FIXTURE.getKneeShotEvent();
        var achievement = FIXTURE.getTenHeadAndKneeShotsAchievement();
        achievement = ACHV.achievementWrapper(achievement);
        var rules = achievement.getRules();
        for (var i = 0; i < 10; i++) {
            engine.process(headShotEvent, achievement, rules[0]);
        }
        for (var j = 0; j < 10; j++) {
            engine.process(kneeShotEvent, achievement, rules[1]);
        }
        assertEquals("satisfied", rules[0].state);
        assertEquals("satisfied", rules[1].state);
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
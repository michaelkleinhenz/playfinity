/*global ACHV, FIXTURE*/
TestCase("CounterEngineTest", {

    testProcessToUnlockEvent: function() {
        var isLocked = true;
        var engine = new ACHV.CounterEngine();
        var event = FIXTURE.getHeadShotEvent();
        var achievement = FIXTURE.getTenHeadShotsAchievement();
        achievement = ACHV.achievementWrapper(achievement);
        var rules = achievement.getRules();
        for (var i = 0; i < 10; i++) {
            engine.process(event, rules[0], this.valueChanged);
        }
        assertEquals("satisfied", rules[0].state);
    },

    testProcessStillLockedSingleCounter: function() {
        var engine = new ACHV.CounterEngine(),
            event = FIXTURE.getHeadShotEvent(),
            achievement = ACHV.achievementWrapper(FIXTURE.getTenHeadShotsAchievement()),
            rules = achievement.getRules();

        engine.process(event, rules[0], this.valueChanged);
        assertEquals("inProgress", rules[0].state);
    },

    testProcessToUnlockEventAlternate: function () {
        "use strict";
        var isLocked = true;
        var engine = new ACHV.CounterEngine();
        var headShotEvent = FIXTURE.getHeadShotEvent();
        var kneeShotEvent = FIXTURE.getKneeShotEvent();
        var achievement = FIXTURE.getTenHeadAndKneeShotsAchievement();
        achievement = ACHV.achievementWrapper(achievement);
        var rules = achievement.getRules();
        for (var i = 0; i < 10; i++) {
            engine.process(headShotEvent, rules[0], this.valueChanged);
            engine.process(kneeShotEvent, rules[1], this.valueChanged);
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
            engine.process(headShotEvent, rules[0], this.valueChanged);
        }
        for (var j = 0; j < 10; j++) {
            engine.process(kneeShotEvent, rules[1], this.valueChanged);
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
        };
        for (var i = 0; i < 10; i++) {
            engine.process(kneeShotEvent, achievement, callback);
        }
        assertTrue(isLocked);
    },

    valueChanged: function(isChanged) {

    }
});
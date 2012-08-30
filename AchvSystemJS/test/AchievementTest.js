TestCase("AchievementTest", {

    testNewAchievement : function() {
	var achievement = new ACHV.Achievement("MyAchievement");
	assertEquals("MyAchievement", achievement.name);
    },

    testAddUnlockRule : function() {
	var achievement = FIXTURE.MyAchievement;
	var unlockRule = mock(ACHV.UnlockRule);
	achievement.addUnlockRule(unlockRule);
	assertTrue(Utils.arrayContains(achievement.unlockRules, unlockRule));
    },

    testProcessCorrespondingEvent : function() {
	var achievement = FIXTURE.MyAchievement;
	var initialEventCounterValue = achievement.getEventCounterValue();
	achievement.processEvent("CorrespondingEvent");
	var currentEventCounterValue = achievement.getEventCounterValue();
	assertEquals(initialEventCounterValue + 1, currentEventCounterValue);
    },

    testProcessNotCorrespondingEvent : function() {
	var achievement = FIXTURE.MyAchievement;
	var initialEventCounterValue = achievement.getEventCounterValue();
	achievement.processEvent("NotCorrespondingEvent");
	var currentEventCounterValue = achievement.getEventCounterValue();
	assertEquals(initialEventCounterValue, currentEventCounterValue);
    },

    testIsUnlocked : function() {
	var achievement = FIXTURE.MyAchievement;
	assertFalse(achievement.isUnlocked());
    },

    testProcessEventUnlocked : function() {
	var isNotifiedUnlock = this.processEvent("CorrespondingEvent");
	assertTrue(isNotifiedUnlock);
    },

    testProcessEventNotUnlocked : function() {
	var isNotifiedUnlock = this.processEvent("SomeEvent");
	assertFalse(isNotifiedUnlock);
    },

    processEvent : function(event) {
	var isNotifiedUnlock = false;
	var achievement = new ACHV.Achievement("TestProcessEventAchievement");
	var unlockRule = new ACHV.UnlockRule("TestProcessEventUnlockRule");
	unlockRule.addUnlockEvent("CorrespondingEvent");
	achievement.addUnlockRule(unlockRule);
	var notifyUnlocked = function(achievementName) {
	    isNotifiedUnlock = true;
	};
	achievement.processEvent(event, notifyUnlocked);
	return isNotifiedUnlock;
    }
});

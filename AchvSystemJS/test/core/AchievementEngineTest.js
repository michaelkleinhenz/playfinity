TestCase("AchievementEngineTest", {
    
    setUp: function() {
        var engines = new HashMap();
        var achievements = new HashMap();
        achievementEngine = new ACHV.AchievementEngine(engines, achievements);
    },

    testRegisterEngine : function() {
        var engine = new ACHV.CounterEngine();
        achievementEngine.registerEngine(engine);
        var resultAchievementEngine = achievementEngine.getEngineForAchievementType(engine.achievementType);
        assertEquals(engine, resultAchievementEngine);
    },
    
    testRegisterAchievement: function() {
    	var achievement = FIXTURE.getStartGameAchievement();
        var achievements = achievementEngine.getAchievements();
        assertFalse(Utils.arrayContains(achievements,achievement));
    	achievementEngine.registerAchievement(achievement);
        achievements = achievementEngine.getAchievements();
        assertTrue(Utils.arrayContains(achievements, achievement));
    },

    testGetAchievement: function() {
        var achievement = FIXTURE.getStartGameAchievement();
        achievementEngine.registerAchievement(achievement);
        var resultAchievement = achievementEngine.getAchievement(achievement.name);
        assertEquals(achievement, resultAchievement);
    },
    
    testRegisterAdditionallyAchievementForEvent: function() {
	var startGameAchievement = FIXTURE.getStartGameAchievement();
    	achievementEngine.registerAchievement(startGameAchievement);
    	var firstStartAchievement = FIXTURE.getFirstStartAchievement();
    	achievementEngine.registerAchievement(firstStartAchievement);
    	var resultAchievements = achievementEngine.getAchievementsForEventType("StartGameEvent");
    	var expectedAchievements = [startGameAchievement, firstStartAchievement];
    	assertEquals(expectedAchievements, resultAchievements);
    },
    
    testGetAchievements: function() {
	var startGameAchievement = FIXTURE.getStartGameAchievement();
	var headShotAchievement = FIXTURE.getTenHeadShotsAchievement();
	achievementEngine.registerAchievement(startGameAchievement);
	achievementEngine.registerAchievement(headShotAchievement);
	var achievements = achievementEngine.getAchievements();
	assertTrue(Utils.arrayContains(achievements, startGameAchievement));
	assertTrue(Utils.arrayContains(achievements, headShotAchievement));
	
    },

    testProcessOneShotEvent: function() {
        var engine = new ACHV.OneShotEngine();
        achievementEngine.registerEngine(engine);

        var achievement = FIXTURE.getStartGameAchievement();
        achievementEngine.registerAchievement(achievement);

        var event = FIXTURE.getStartGameEvent();

        achievementEngine.processEvent(event, function notifyUnlock(achievements) {
            var index = achievements.indexOf(achievement);
            var resultAchievement = achievements[index];
            assertFalse(resultAchievement.locked);
        });
    },

    testAchievementTypeOnce: function() {
        var engine = new ACHV.OneShotEngine();
        achievementEngine.registerEngine(engine);

        var onceAchievement = FIXTURE.getFirstStartAchievement();
        achievementEngine.registerAchievement(onceAchievement);
        var achievements = achievementEngine.getAchievements();
        assertTrue(Utils.arrayContains(achievements, onceAchievement));

        var event = FIXTURE.getStartGameEvent();
        achievementEngine.processEvent(event, function(unlockedAchievements) {
            assertTrue(Utils.arrayContains(unlockedAchievements, onceAchievement));
        });
        achievements = achievementEngine.getAchievements();
        assertFalse(Utils.arrayContains(achievements, onceAchievement));
    },

    testRemoveOnceAchievementForTwoEvents: function() {
	    // set engine
    	var engine = new ACHV.CounterEngine();
    	achievementEngine.registerEngine(engine);
	
	    // set achievement
    	var achievement = FIXTURE.getTenHeadAndKneeShotsAchievement();
    	achievementEngine.registerAchievement(achievement);
	
	    // check achievement registered
    	var achievements = achievementEngine.getAchievements();
    	assertTrue(Utils.arrayContains(achievements, achievement));
	
	    // trigger unlock event
    	var headShotEvent = FIXTURE.getHeadShotEvent();
	    var kneeShotEvent = FIXTURE.getKneeShotEvent();
    	for (var i = 0; i < 10; i++) {
	        achievementEngine.processEvent(headShotEvent, notifyUnlock);
	    }
	    for (var j = 0; j < 10; j++) {
            achievementEngine.processEvent(kneeShotEvent, notifyUnlock);
        }

    	// check achievement removed
	    achievements = achievementEngine.getAchievements();
    	assertFalse(Utils.arrayContains(achievements, achievement));
	
	    function notifyUnlock(unlockedAchievements) {
	        assertTrue(Utils.arrayContains(unlockedAchievements, achievement));
    	}
    },
    
    testAchievementTypeMultiInfinite: function() {
	    // set engine
    	var engine = new ACHV.OneShotEngine();
    	achievementEngine.registerEngine(engine);
	
    	// set achievement without frequency property
    	var achievement = FIXTURE.getStartGameAchievement();
    	achievementEngine.registerAchievement(achievement);

		// check achievement registered
    	var achievements = achievementEngine.getAchievements();
	    assertTrue(Utils.arrayContains(achievements, achievement));

    	// trigger unlock event twice
    	var event = FIXTURE.getStartGameEvent();
        achievementEngine.processEvent(event, notifyUnlock);
	    achievementEngine.processEvent(event, notifyUnlock);

	    // check achievement still there
    	achievements = achievementEngine.getAchievements();
	    assertTrue(Utils.arrayContains(achievements, achievement));
	
    	function notifyUnlock(unlockedAchievements) {
	        assertTrue(Utils.arrayContains(unlockedAchievements, achievement));
    	}
    },

    testAchievementTypeMultiTwoTimes: function() {

	    // set engine
    	var engine = new ACHV.CounterEngine();
    	achievementEngine.registerEngine(engine);

    	// set achievement with frequency property
    	var achievement = FIXTURE.getTenHeadShotsAchievement();
    	achievementEngine.registerAchievement(achievement);

		// check achievement registered
    	var achievements = achievementEngine.getAchievements();
	    assertTrue(Utils.arrayContains(achievements, achievement));

    	// trigger event to unlock first time
    	var event = FIXTURE.getHeadShotEvent();
        for (var i = 0; i < 10; i++) {
         achievementEngine.processEvent(event, notifyUnlock);
        }

	    // check achievement still there
    	achievements = achievementEngine.getAchievements();
	    assertTrue(Utils.arrayContains(achievements, achievement));

        // trigger event to unlock second time
        for (var i = 0; i < 10; i++) {
         achievementEngine.processEvent(event, notifyUnlock);
        }

        // check achievement removed
        achievements = achievementEngine.getAchievements();
        assertFalse(Utils.arrayContains(achievements, achievement));

    	function notifyUnlock(unlockedAchievements) {
	        assertTrue(Utils.arrayContains(unlockedAchievements, achievement));
    	}
    },

    testTenHeadShotsInTenMinutesAchievementUnlocked: function() {
        // set engines
    	var counterEngine = new ACHV.CounterEngine();
    	achievementEngine.registerEngine(counterEngine);
        var timerEngine = ACHV.timerEngine({"achievementType": "TimerRule"});
        achievementEngine.registerEngine(timerEngine);

    	// set achievement
    	var achievement = FIXTURE.getTenHeadShotsInTenMinutesAchievement();
    	achievementEngine.registerAchievement(achievement);

        // trigger event to unlock
    	var event = FIXTURE.getHeadShotEvent();
        var initDate = Date.now() / 1000;
        for (var i = 0; i < 10; i++) {
            event.tsInit = initDate + (i); // add i x one seconds.
            achievementEngine.processEvent(event, notifyUnlock);
        }

        // check achievement removed
        var achievements = achievementEngine.getAchievements();
        assertFalse(Utils.arrayContains(achievements, achievement));

        function notifyUnlock(unlockedAchievements) {
            assertTrue(Utils.arrayContains(unlockedAchievements, achievement));
       }
    },

    testTenHeadShotsInTenMinutesAchievementLocked: function() {
        // set engines
        var counterEngine = new ACHV.CounterEngine();
        achievementEngine.registerEngine(counterEngine);
        var timerEngine = ACHV.timerEngine('TimerAchievementType');
        achievementEngine.registerEngine(timerEngine);

        // set achievement
        var achievement = FIXTURE.getTenHeadShotsInTenMinutesAchievement();
        achievementEngine.registerAchievement(achievement);

        // trigger event to unlock
        var event = FIXTURE.getHeadShotEvent();
        var initDate = Date.now() / 1000;
        for (var i = 0; i < 10; i++) {
            event.tsInit = initDate + (i * 60); // add i x one minute.
            achievementEngine.processEvent(event, notifyUnlock);
        }

        // check achievement removed
        var achievements = achievementEngine.getAchievements();
        assertTrue(Utils.arrayContains(achievements, achievement));

        function notifyUnlock(unlockedAchievements) {
            assertFalse(Utils.arrayContains(unlockedAchievements, achievement));
        }
    },


    /**
     * Unlock achievement.
     * (TenHeadShots -> TenKneeShots) || TenChestShots
     * All events are triggered in row.
     * First TenHeadShots, then TenKneeShots and finally TenChestShots.
     */
    testTenHeadShotsSeqTenKneeShotsParTenChestShots: function() {
        // set engine
        var counterEngine = new ACHV.CounterEngine();
        achievementEngine.registerEngine(counterEngine);

        // set achievement
        var achievement = FIXTURE.getTenHeadShotsSeqTenKneeShotsParTenChestShots();
        achievementEngine.registerAchievement(achievement);

        // trigger events
        var headShotEvent = FIXTURE.getHeadShotEvent();
        this.multiProcessEvent(headShotEvent, 10);
        achievement = ACHV.achievementWrapper(achievement);
        var rules = achievement.getRules();
        assertEquals("satisfied", rules[0].state);

        var kneeShotEvent = FIXTURE.getKneeShotEvent();
        this.multiProcessEvent(kneeShotEvent, 10);
        rules = achievement.getRules();
        assertEquals("satisfied", rules[1].state);

        var chestShotEvent = FIXTURE.getChestShotEvent();
        this.multiProcessEvent(chestShotEvent, 10);
        rules = achievement.getRules();
        assertEquals("satisfied", rules[2].state);

        var achievements = achievementEngine.getAchievements();
        assertFalse(Utils.arrayContains(achievements, achievement));
    },

    /**
     * Locked achievement.
     * (TenHeadShots -> TenKneeShots) || TenChestShots
     * Sequential events are triggered in wrong order.
     * First TenKneeShots, then TenHeadShots and finally TenChestShots.
     */
    testTenHeadShotsSeqTenKneeShotsParTenChestShotsTwo: function() {
       // set engine
        var counterEngine = new ACHV.CounterEngine();
        achievementEngine.registerEngine(counterEngine);

        // set achievement
        var achievement = FIXTURE.getTenHeadShotsSeqTenKneeShotsParTenChestShots();
        achievementEngine.registerAchievement(achievement);
        achievement = ACHV.achievementWrapper(achievement);

        // trigger events
        var kneeShotEvent = FIXTURE.getKneeShotEvent();
        this.multiProcessEvent(kneeShotEvent, 10);
        var rules = achievement.getRules();
        assertEquals("inProgress", rules[1].state);

        var headShotEvent = FIXTURE.getHeadShotEvent();
        this.multiProcessEvent(headShotEvent, 10);
        rules = achievement.getRules();
        assertEquals("satisfied", rules[0].state);

        var chestShotEvent = FIXTURE.getChestShotEvent();
        this.multiProcessEvent(chestShotEvent, 10);
        rules = achievement.getRules();
        assertEquals("satisfied", rules[2].state);

        var achievements = achievementEngine.getAchievements();
        assertTrue(Utils.arrayContains(achievements, achievement));
    },

    multiProcessEvent: function(event, times) {
        var unlockedAchievements = [];
        for (var i = 0; i < times; i++) {
            achievementEngine.processEvent(event, function notifyUnlock(achievements) {
              for(var j = 0; j< achievements.length; j++) {
                  unlockedAchievements.push(achievements[j]);
              }
            });
        }
        return unlockedAchievements;
    }
});
TestCase("AchievementEngineTest", {
    
    setUp: function() {
	var engines = new HashMap();
	var achievements = new HashMap();
	achievementEngine = new ACHV.AchievementEngine(engines, achievements);
    },
    
    testRegisterEngine : function() {
	var json = FIXTURE.getFixtureContent("OneShotEngine.json");
	var engine = JSON.parse(json);
	achievementEngine.registerEngine(engine);
	var resultAchievementEngine = achievementEngine.getEngineForAchievementType(engine.achievementType);
	assertEquals(engine, resultAchievementEngine);
    },
    
    testRegisterAchievement: function() {
    	var achievement = FIXTURE.getStartGameAchievement();
    	achievementEngine.registerAchievement(achievement);
    	var event = achievement.events[0];
    	var resultAchievements = achievementEngine.getAchievementsForEventType(event.name);
    	var expectedAchievements = [achievement];
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
	var engine = mock(ACHV.OneShotEngine);
	engine.achievementType = "OneShotAchievementType";
	achievementEngine.registerEngine(engine);
	
	var achievement = FIXTURE.getStartGameAchievement();
	achievementEngine.registerAchievement(achievement);
	
	var event = FIXTURE.getStartGameEvent();
	achievementEngine.processEvent(event, function notifyUnlock(achievement) {
	    assertFalse(achievement.locked);
	});
    }
});
TestCase("OneShotEngineTest", {
    
    testProcess : function() {
	var engine = new ACHV.OneShotEngine();
	var event = FIXTURE.getStartGameEvent();
	var startGameAchievement = FIXTURE.getStartGameAchievement();
	var callback = function(achievement) {
	    assertFalse(achievement.locked);
	};
	engine.process(event, startGameAchievement, callback);
    }
});
TestCase("OneShotEngineTest", {

    testProcess : function() {
        var engine = new ACHV.OneShotEngine();
        var event = FIXTURE.getStartGameEvent();
        var achievement = FIXTURE.getStartGameAchievement();
        achievement = ACHV.achievementWrapper(achievement);
        var rules = achievement.getRules();
        engine.process(event, achievement,rules[0]);
        assertEquals("satisfied",rules[0].state);
    }
});
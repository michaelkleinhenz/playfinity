TestCase("StopWatchEngineTest", {
    
    testProcess : function() {
        var myEngine = ACHV.stopWatchEngine({achievementType: 'StopWatchRule'});
        var startGameEvent = FIXTURE.getStartGameEvent();
        var stopGameEvent = FIXTURE.getStopGameEvent();
        var playForTenSecondsAchievement = FIXTURE.getPlayForTenSecondsAchievement();
        var achievement = ACHV.achievementWrapper(playForTenSecondsAchievement);
        var rules = achievement.getRules();
        myEngine.process(startGameEvent, playForTenSecondsAchievement, rules[0]);
        myEngine.process(stopGameEvent, playForTenSecondsAchievement, rules[0]);
        assertEquals("broken", rules[0].state);
    }
});
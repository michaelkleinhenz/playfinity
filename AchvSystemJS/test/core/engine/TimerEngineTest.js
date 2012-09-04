TestCase("TimerEngineTest", {
    
    testProcess : function() {
        var engine = timerEngine({achievementType: 'TimerAchievementType'});
        var startGameEvent = FIXTURE.getStartGameEvent();
        var stopGameEvent = FIXTURE.getStopGameEvent();
        var playForTenSecondsAchievement = FIXTURE.getPlayForTenSecondsAchievement();
        engine.process(startGameEvent, playForTenSecondsAchievement, function(achievement){});
        engine.process(stopGameEvent, playForTenSecondsAchievement, function(achievement){});
        assertFalse(playForTenSecondsAchievement.locked);
    }
});
TestCase("TimerEngineTest", {
    
    testProcess : function() {
        var myEngine = ACHV.timerEngine({achievementType: 'TimerAchievementType'});
        var startGameEvent = FIXTURE.getStartGameEvent();
        var stopGameEvent = FIXTURE.getStopGameEvent();
        var playForTenSecondsAchievement = FIXTURE.getPlayForTenSecondsAchievement();
        myEngine.process(startGameEvent, playForTenSecondsAchievement, function(achievement){});
        myEngine.process(stopGameEvent, playForTenSecondsAchievement, function(achievement){});
        assertFalse(playForTenSecondsAchievement.locked);
    }
});
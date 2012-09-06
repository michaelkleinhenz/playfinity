TestCase("TimerEngineTest", {
    
    testProcess : function() {
        var myEngine = ACHV.timerEngine({achievementType: 'TimerAchievementType'});
        var startGameEvent = FIXTURE.getStartGameEvent();
        var stopGameEvent = FIXTURE.getStopGameEvent();
        var playForTenSecondsAchievement = FIXTURE.getPlayForTenSecondsAchievement();
        var achievementType = playForTenSecondsAchievement.types[0];
        myEngine.process(startGameEvent, playForTenSecondsAchievement, achievementType);
        myEngine.process(stopGameEvent, playForTenSecondsAchievement, achievementType);
        assertEquals("broken", achievementType.result);
    }
});
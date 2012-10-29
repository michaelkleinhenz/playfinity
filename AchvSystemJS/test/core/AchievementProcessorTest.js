/*global ACHV, FIXTURE*/
TestCase("AchievementProcessorTest", {
    testProcessAchievement: function () {
        "use strict";
        var processor = ACHV.achievementProcessor(),
            achievement = FIXTURE.getStartGameAchievement(),
            event = FIXTURE.getStartGameEvent(),
            engines = {
                "TimerRule": ACHV.timerEngine({"achievementType": "TimerRule"}),
                "OneShotRule": new ACHV.OneShotEngine(),
                "CounterRule": new ACHV.CounterEngine(),
                "StopWatchRule": ACHV.stopWatchEngine({"achievementType": "StopWatchRule"})
            };
        processor.process(achievement, engines, event, function (error, result) {
            assertNull(error);
            assertTrue(result.isUnlocked);
            assertTrue(result.isValueChanged);
        });
    }
});
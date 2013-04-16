/*global ACHV, FIXTURE*/
TestCase("OneShotEngineTest", {

    testProcess : function () {
        "use strict";
        var engine = new ACHV.OneShotEngine(),
            event = FIXTURE.getStartGameEvent(),
            achievement = ACHV.achievementWrapper(FIXTURE.getStartGameAchievement()),
            rules = achievement.getRules();
        engine.process(event, rules[0], function () {});
        assertEquals("satisfied", rules[0].state);
    }
});
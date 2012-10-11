TestCase("AchievementSystemTest", {

    self : {},

    setUp: function() {
        var conf = {
            "achievementStore" : mock(ACHV.achievementStore({})),
            "achievementInstanceStore" : mock(ACHV.achievementInstanceStore({})),
            "achievementEngines": {}
        };
        self.defaultAchvSys = new ACHV.AchievementSystem(conf);
    },

    testRegisterGame : function() {
        var conf = {};
        var achievementSystem = new ACHV.AchievementSystem(conf);
        achievementSystem.registerGame("MyGame");
        var isRegistered = achievementSystem.isRegistered("MyGame");
        assertTrue(isRegistered);
    },

    testIsAchivementUnlocked: function() {
        var achievementEngineMock = mock(new ACHV.AchievementEngine());
        var achievement = FIXTURE.getStartGameAchievement();
        when(achievementEngineMock).getAchievements().thenReturn([achievement]);

        var achvSystemConf = {
            achievementStore: mock(ACHV.achievementStore({})),
            achievementInstanceStore: mock(ACHV.achievementInstanceStore({})),
            achievementEngines: { "1_2": achievementEngineMock}
        };
        var achievementSystem = new ACHV.AchievementSystem(achvSystemConf);
        var isUnlocked = achievementSystem.isAchievementUnlocked(1,2,achievement);
        assertFalse(isUnlocked);
    },

    testTriggerEvent: function() {

    }

});
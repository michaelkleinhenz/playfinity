TestCase("AchievementSystemTest", {
    testRegisterAchievement : function() {
	var achievementEngineMock = mock(ACHV.AchievementEngine);
    var conf = {
      "achievementEngine":achievementEngineMock
    };
	var achievementSystem = new ACHV.AchievementSystem(conf);
	var achievement = FIXTURE.getStartGameAchievement();
	achievementSystem.registerAchievement(achievement);
	when(achievementEngineMock).getAchievements().thenReturn([achievement]);
	var achievements = achievementSystem.getAchievements();
	assertTrue(Utils.arrayContains(achievements, achievement));
    },

    testRegisterGame : function() {
        var conf = {};
        var achievementSystem = new ACHV.AchievementSystem(conf);
        achievementSystem.registerGame("MyGame");
        var isRegistered = achievementSystem.isRegistered("MyGame");
        assertTrue(isRegistered);
    },

    testIsAchivementUnlocked: function() {
        var achievementEngineMock = mock(ACHV.AchievementEngine);
        var conf = {
            "achievementEngine" : achievementEngineMock
        };
        var achievementSystem = new ACHV.AchievementSystem(conf);
        var achievement = FIXTURE.getStartGameAchievement();
        achievementSystem.registerAchievement(achievement);
        when(achievementEngineMock).getAchievements().thenReturn([achievement]);
        var isUnlocked = achievementSystem.isAchievementUnlocked(achievement);
        assertFalse(isUnlocked);
    }
});
TestCase("AchievementSystemTest", {
    testRegisterAchievement : function() {
	var achievementEngineMock = mock(ACHV.AchievementEngine);
	var achievementSystem = new ACHV.AchievementSystem(achievementEngineMock);
	var achievement = mock(ACHV.Achievement);
	achievementSystem.registerAchievement(achievement);
	when(achievementEngineMock).getAchievements().thenReturn([achievement]);
	var achievements = achievementSystem.getAchievements();
	assertTrue(Utils.arrayContains(achievements, achievement));
    },

    testRegisterGame : function() {
	var achievementSystem = new ACHV.AchievementSystem();
	achievementSystem.registerGame("MyGame");
	var isRegistered = achievementSystem.isRegistered("MyGame");
	assertTrue(isRegistered);
    }   
});
TestCase("AchievementSystemTest", {

    self : {},

    setUp: function() {
        var achvInstanceStoreMock =  mock(ACHV.achievementInstanceStore({}));

        when(achvInstanceStoreMock).getAchievementsForGameIdAndUserId(anything()).
            then(function(gameId, user, callback) {
                var startGameAchievement = FIXTURE.getStartGameAchievement();
                var doc = {
                    "value" : startGameAchievement
                };
                var body = {
                    rows: {}
                };
                body.rows.forEach = function(forEachCallBack) {
                    forEachCallBack(doc);
                };
                callback(null, body, {});
            });

        var conf = {
            "achievementStore" : mock(ACHV.achievementStore({})),
            "achievementInstanceStore" : achvInstanceStoreMock,
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

    testCreatingAchievementEngineForGameAndUser: function() {
        var event = FIXTURE.getStartGameEvent();
        var gameId = event.gameId;
        var userId = event.userId;

        self.defaultAchvSys.getAchievementEngineForGameAndUser(gameId, userId, function(achievementEngine) {
            assertUndefined(achievementEngine);
        });

        self.defaultAchvSys.triggerEvent(event, function(achievements) {

        });

        self.defaultAchvSys.getAchievementEngineForGameAndUser(gameId, userId, function(achievementEngine) {
            assertNotUndefined(achievementEngine);
        });
    },

    testUseAlreadyCreatedEngine: function() {
        
    }
});
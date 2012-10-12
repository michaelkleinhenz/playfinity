TestCase("AchievementSystemTest", {

    self : {},

    setUp: function () {
        var achvInstanceStoreMock =  mock(ACHV.achievementInstanceStore({}));

        when(achvInstanceStoreMock).getAchievementsForGameIdAndUserId(anything(), anything()).
            then(function(gameId, user, callback) {
                var startGameAchievement = FIXTURE.getStartGameAchievement();
                var startGameAchievementDoc = {
                    "value" : startGameAchievement
                };
                var twoHeadShotsAchievement = FIXTURE.getTwoHeadShotsAchievement();
                twoHeadShotsAchievement.gameId = 1;
                twoHeadShotsAchievement.userId = 2;
                var twoHeadShotsAchievementDoc = {
                    "value": twoHeadShotsAchievement
                };
                var achievementDocs = [startGameAchievementDoc, twoHeadShotsAchievementDoc];
                var body = {
                    rows: {}
                };

                body.rows.forEach = function(forEachCallBack) {
                    for (var i = 0; i < achievementDocs.length; i++) {
                        forEachCallBack(achievementDocs[i]);
                    }
                };
                callback(null, body, {});
            });

        var conf = {
            "achievementStore" : mock(ACHV.achievementStore({})),
            "achievementInstanceStore" : achvInstanceStoreMock,
            "achievementEngines": {},
            "eventBus": new EventEmitter()
        };
        self.defaultAchvSys = new ACHV.AchievementSystem(conf);
    },

    testRegisterGame : function() {
        var conf = {
            eventBus: new EventEmitter()
        };
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
            achievementEngines: { "1_2": achievementEngineMock},
            eventBus: new EventEmitter()
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
        var headShotEvent = FIXTURE.getHeadShotEvent();
        var gameId = headShotEvent.gameId = 1;
        var userId = headShotEvent.userId = 2;
        // Init achievement engine via StartGameEvent
        self.defaultAchvSys.triggerEvent(FIXTURE.getStartGameEvent(), function(achievements) {
        });

        // check achievement engine already exists.
        self.defaultAchvSys.getAchievementEngineForGameAndUser(gameId, userId, function(achievementEngine) {
            assertNotUndefined(achievementEngine);
        });

        // send two HeadShotEvents
        self.defaultAchvSys.triggerEvent(headShotEvent, function(achievements) {});
        self.defaultAchvSys.triggerEvent(headShotEvent, function(achievements) {
            var isUnlocked = false;
            // check achievement unlocked
            for (var i = 0; i < achievements.length; i++) {
                if (achievements[i].name == "TwoHeadShotsAchievement") {
                    isUnlocked = true;
                    assertEquals(1, achievements[i].gameId);
                    assertEquals(2, achievements[i].userId);
                }
            }
            assertTrue(isUnlocked);
        });
    }
});
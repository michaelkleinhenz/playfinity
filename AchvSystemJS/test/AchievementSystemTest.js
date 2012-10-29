/*global ACHV, EventEmitter, FIXTURE*/

TestCase("AchievementSystemTest", {

    setUp: function () {
        "use strict";
        var achvInstanceStoreMock = this.achvInstanceStoreMock =  mock(ACHV.achievementInstanceStore({})),
            achvStoreMock = mock(ACHV.achievementStore({})),
            achvSysConf = {
                "achievementStore" : achvStoreMock,
                "achievementInstanceStore" : achvInstanceStoreMock,
                "achievementEngines": {},
                "eventBus": new EventEmitter()
            };

        when(achvInstanceStoreMock).getAchievementsForGameIdAndUserId(anything(), anything()).
            then(function(gameId, user, callback) {
                var startGameAchievement = FIXTURE.getStartGameAchievement(),
                    startGameAchievementDoc = {
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

                body.rows.forEach = function (forEachCallBack) {
                    var i = 0;
                    for (i; i < achievementDocs.length; i++) {
                        forEachCallBack(achievementDocs[i]);
                    }
                };
                callback(null, body, {});
            });

        when(achvInstanceStoreMock).createOrUpdateAchievementInstance(anything()).
            then(function () {});

        when(achvStoreMock).getAchievementsForGameId(anything()).
            then(function (gameId, callback) {
                var twoHeadShotsAchievement = FIXTURE.getTwoHeadShotsAchievement(),
                    doc = {
                        value: twoHeadShotsAchievement
                    },
                    body = {
                        rows: {}
                    };

                twoHeadShotsAchievement.gameId = 1;
                body.rows.forEach = function (forEachCallBack) {
                    forEachCallBack(doc);
                };
                callback(null, body, {});
            });

        this.defaultAchvSys = new ACHV.AchievementSystem(achvSysConf);
    },

    testRegisterGame : function () {
        this.defaultAchvSys.registerGame("MyGame");
        var isRegistered = this.defaultAchvSys.isRegistered("MyGame");
        assertTrue(isRegistered);
    },

    testIsAchivementUnlocked: function () {
        var eventBus = new EventEmitter(),
            achvEngineConf = {
                "eventBus": eventBus
            },
            achievementEngineMock = mock(new ACHV.AchievementEngine(achvEngineConf)),
            achievement = FIXTURE.getStartGameAchievement(),
            achvSystemConf = {
                achievementStore: mock(ACHV.achievementStore({})),
                achievementInstanceStore: mock(ACHV.achievementInstanceStore({})),
                achievementEngines: { "1_2": achievementEngineMock},
                eventBus: eventBus
            },
            achievementSystem = new ACHV.AchievementSystem(achvSystemConf);
        when(achievementEngineMock).getAchievements().thenReturn([achievement]);
        var isUnlocked = achievementSystem.isAchievementUnlocked(1, 2, achievement);
        assertFalse(isUnlocked);
    },

    testCreatingAchievementEngineForGameAndUser: function () {
        var  achvSystem = this.defaultAchvSys;
        var event = FIXTURE.getStartGameEvent();
        var gameId = event.gameId;
        var userId = event.userId;

        achvSystem.getAchievementEngineForGameAndUser(gameId, userId, function (achievementEngine) {
            assertUndefined(achievementEngine);
        });


        achvSystem.triggerEvent(event, function (achievements) {
            achvSystem.getAchievementEngineForGameAndUser(gameId, userId, function(achievementEngine) {
                assertNotUndefined(achievementEngine);
            });
        });

    }
    /*
    testCreateAchievementInstancesForGame: function () {
        "use strict";
        var initGameEvent = FIXTURE.getFixtureObj("event/InitGameEvent.json");
        // trigger init game event
        this.defaultAchvSys.triggerEvent(initGameEvent, function(achievements) {});
        // check create method for achievement is called
        verify(this.achvInstanceStoreMock, times(1)).createOrUpdateAchievementInstance();
    }
    */
});
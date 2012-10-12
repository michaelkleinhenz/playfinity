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

                body.rows.forEach = function (forEachCallBack) {
                    var i = 0;
                    for (i; i < achievementDocs.length; i++) {
                        forEachCallBack(achievementDocs[i]);
                    }
                };
                callback(null, body, {});
            });

        when(achvInstanceStoreMock).createAchievementInstance(anything()).
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

        this.defaultAchvSys.getAchievementEngineForGameAndUser(gameId, userId, function(achievementEngine) {
            assertUndefined(achievementEngine);
        });

        this.defaultAchvSys.triggerEvent(event, function(achievements) {

        });

        this.defaultAchvSys.getAchievementEngineForGameAndUser(gameId, userId, function(achievementEngine) {
            assertNotUndefined(achievementEngine);
        });
    },

    testUseAlreadyCreatedEngine: function() {
        var headShotEvent = FIXTURE.getHeadShotEvent(),
            gameId = headShotEvent.gameId = 1,
            userId = headShotEvent.userId = 2;
        // Init achievement engine via StartGameEvent
        this.defaultAchvSys.triggerEvent(FIXTURE.getStartGameEvent(), function(achievements) {
        });

        // check achievement engine already exists.
        this.defaultAchvSys.getAchievementEngineForGameAndUser(gameId, userId, function(achievementEngine) {
            assertNotUndefined(achievementEngine);
        });

        // send two HeadShotEvents
        this.defaultAchvSys.triggerEvent(headShotEvent, function(achievements) {});
        this.defaultAchvSys.triggerEvent(headShotEvent, function(achievements) {
            var isUnlocked = false;
            // check achievement unlocked
            for (var i = 0; i < achievements.length; i++) {
                if (achievements[i].name === "TwoHeadShotsAchievement") {
                    isUnlocked = true;
                    assertEquals(1, achievements[i].gameId);
                    assertEquals(2, achievements[i].userId);
                }
            }
            assertTrue(isUnlocked);
        });
    },

    testCreateAchievementInstancesForGame: function () {
        "use strict";
        var initGameEvent = FIXTURE.getFixtureObj("event/InitGameEvent.json");
        // trigger init game event
        this.defaultAchvSys.triggerEvent(initGameEvent, function(achievements) {});
        // check create method for achievement is called
        verify(this.achvInstanceStoreMock, times(1)).createAchievementInstance();
    }
});
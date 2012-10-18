/*
AsyncTestCase('AchievementSystemAsynTest', {

    // TODO reuse defaultAchvSystem from AchievementSystemTest
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

    testUseAlreadyCreatedEngine: function (queue) {

        var headShotEvent = FIXTURE.getHeadShotEvent(),
            gameId = headShotEvent.gameId = 1,
            userId = headShotEvent.userId = 2;

        queue.call('Step 1: Init AchievementEngine via StartGameEvent', function (callbacks) {
            var triggerEventCallback = callbacks.add(function (achievements) {
                assertNotUndefined(achievements);
            });
            this.defaultAchvSys.triggerEvent(FIXTURE.getStartGameEvent(), triggerEventCallback);
        });

        queue.call('Step 2: Check achievement engine already exists.', function (callbacks) {
            var achievementEngineCallback = callbacks.add(function (achievementEngine) {
                assertNotUndefined(achievementEngine);
            });
            this.defaultAchvSys.getAchievementEngineForGameAndUser(gameId, userId, achievementEngineCallback);
        });

        queue.call('Step 3: Check TwoHeadShotsAchievement unlocked.', function (callbacks) {
            var triggerEventCallBack = callbacks.add(function (achievements) {
                var isUnlocked = false;
                for (var i = 0; i < achievements.length; i++) {
                    if (achievements[i].name === "TwoHeadShotsAchievement") {
                        isUnlocked = true;
                        assertEquals(1, achievements[i].gameId);
                        assertEquals(2, achievements[i].userId);
                    }
                }
                assertTrue(isUnlocked);
            });
            this.defaultAchvSys.triggerEvent(headShotEvent, function (achievements) {});
            this.defaultAchvSys.triggerEvent(headShotEvent, triggerEventCallBack);
        });
    }
});
*/


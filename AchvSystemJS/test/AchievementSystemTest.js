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

        // AchievementInstanceStore getAchievementsForGameIdAndUserId
        // Valid
        when(achvInstanceStoreMock).getAchievementsForGameIdAndUserId(not(3), anything()).
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
        // Error
        when(achvInstanceStoreMock).getAchievementsForGameIdAndUserId(equalTo(3), anything()).
            then(function (gameId, userId, callback) {
                callback("Error reading achievements.", null, null);
            });

        // AchievementInstanceStore createOrUpdateAchievementInstance
        var errorAchievementInstance = {"name":"PlayForTenSecondsAchievement","process":[[{"type":"StopWatchRule","events":[{"name":"StartGameEvent"},{"name":"StopGameEvent"}],"state":"inProgress","startEvent":"StartGameEvent","stopEvent":"StopGameEvent","timer":0,"TIMER_MAX_SEC":10}]],"locked":true,"frequencyCounter":0,"FREQUENCY_COUNTER_MAX":1,"gameId":2,"userId":2};

        when(achvInstanceStoreMock).createOrUpdateAchievementInstance(not(errorAchievementInstance)).
            then(function (doc, callback) {
                callback(null, "body");
            });

        when(achvInstanceStoreMock).createOrUpdateAchievementInstance(hasMember("name", equalTo("PlayForTenSecondsAchievement"))).
            then(function (doc, callback) {
                callback("Some Error", null);
            });

        // AchievementStore callback with no achievement, gameId=0.
        when(achvStoreMock).getAchievementsForGameId(equalTo(0)).
            then(function (gameId, callback) {
                var body = {
                    rows: {}
                };
                body.rows.length = 0;
                callback(null, body, {});
            });

        // AchievementStore callback with one achievement, gameId=1.
        when(achvStoreMock).getAchievementsForGameId(equalTo(1)).
            then(function (gameId, callback) {
                var twoHeadShotsAchievement = FIXTURE.getTwoHeadShotsAchievement(),
                    doc = {
                        value: twoHeadShotsAchievement
                    },
                    body = {
                        rows: {}
                    };
                body.rows.length = 1;
                twoHeadShotsAchievement.gameId = 1;
                body.rows.forEach = function (forEachCallBack) {
                    forEachCallBack(doc);
                };
                callback(null, body, {});
            });

        // AchievementStore callback with two achievements, gameId=2.
        when(achvStoreMock).getAchievementsForGameId(equalTo(2)).
            then(function (gameId, callback) {
                var twoHeadShotsAchievement = FIXTURE.getTwoHeadShotsAchievement(),
                    docOne = {
                        value: twoHeadShotsAchievement
                    },
                    playForTenSecondsAchievement = FIXTURE.getPlayForTenSecondsAchievement(),
                    docTwo = {
                        value: playForTenSecondsAchievement
                    },
                    body = {
                        rows: {}
                    };
                twoHeadShotsAchievement.gameId = 2;
                playForTenSecondsAchievement.gameId = 2;
                body.rows.length = 2;
                body.rows.forEach = function (forEachCallBack) {
                    forEachCallBack(docOne);
                    forEachCallBack(docTwo);
                };
                callback(null, body, {});
            });

        // AchievementStore callback with error, gameId=3.
        when(achvStoreMock).getAchievementsForGameId(equalTo(3)).
            then(function (gameId, callback) {
                callback("Some Error", null, null);
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

    },

    testInitAchievementsOneAchievement: function () {
        "use strict";
        var id = {
            "gameId": 1,
            "userId": 2
        };
        this.defaultAchvSys.initAchievements(id, initAchievementCallback);

        function initAchievementCallback(error, result) {
            assertNull(error);
            assertEquals("Achievement instances created.", result);
        }
    },

    testInitAchievementsTwoAchievements: function () {
        "use strict";
        var id = {
            "gameId": 2,
            "userId": 2
        };
        this.defaultAchvSys.initAchievements(id, initAchievementsCallback);

        function initAchievementsCallback(error, result) {
            assertNull(error);
            assertEquals("Achievement instances created.", result);
        }
    },

    testInitAchievementsError: function () {
        "use strict";
        var id = {
            "gameId": 3,
            "userId": 2
        };
        this.defaultAchvSys.initAchievements(id, initAchievementsCallback);

        function initAchievementsCallback(error, result) {
            assertNotNull(error);
            assertNull(result);
        }
    },

    testInitAchievementsNoAchievements: function () {
        "use strict";
        var id = {
            "gameId": 0,
            "userId": 2
        };
        this.defaultAchvSys.initAchievements(id, initAchievementsCallback);

        function initAchievementsCallback(error, result) {
            assertNull(error);
            assertEquals("Achievement instances created.", result);
        }
    },

    testInitAchievementEngineError: function () {
        "use strict";
        var event = FIXTURE.getChestShotEvent();
        event.gameId = 3;
        event.userId = 2;
        this.defaultAchvSys.triggerEvent(event, initAchievementEngineCallback);

        function initAchievementEngineCallback(achievement) {
            console.log(achievement);
        }
    }
});
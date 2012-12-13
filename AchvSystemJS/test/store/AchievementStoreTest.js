/*global ACHV*/
TestCase("AchievemenStoreTest", {
    setUp: function () {
        "use strict";
        var db = {
                view: function () {},
                destroy: function () {}
            },
            dbMock = mock(db),
            logger = {
                error: function () {}
            },
            conf = {
                "db": dbMock,
                "logger": logger
            };

        when(dbMock).view(anything()).
            then(function (table, design, key, callback) {
                if (key.key === 1) {
                    callback("error", "result");
                } else {
                    if (key.key[1] === "ErrorAchievement") {
                        callback("error", null);
                    } else {
                        callback(null, "result");
                    }
                }
            });

        when(dbMock).destroy(anything()).
            then(function (name, revision, callback) {
                if (revision === "error_revision") {
                    callback("revision error", null);
                } else {
                    callback(null, "some result");
                }
            });

        this.store = ACHV.achievementStore(conf);
    },

    testGetAchievementsForGameId: function () {
        "use strict";
        this.store.getAchievementsForGameId(1, getAchievementsForGameIdCallback);

        function getAchievementsForGameIdCallback(error, result) {
            assertEquals("error", error);
            assertEquals("result", result);
        }
    },

    testDeleteAchievement: function () {
        "use strict";
        this.store.deleteAchievement("name", "revision", deleteAchievementCallback);

        function deleteAchievementCallback(error, result) {
            assertNull(error);
            assertEquals("some result", result);
        }
    },

    testDeleteAchievementError: function () {
        "use strict";
        this.store.deleteAchievement("name", "error_revision", deleteAchievementCallback);

        function deleteAchievementCallback(error, result) {
            assertNotNull(error);
            assertNull(result);
        }
    },

    testGetAchievementByGameIdAndName: function () {
        "use strict";
        var gameId = 2,
            achievementName = "FirstStartAchievement";
        this.store.getAchievementByGameIdAndName(gameId, achievementName, getAchievementCallback);

        function getAchievementCallback(error, result) {
            assertNull(error);
            assertNotNull(result);
        }
    },

    testGetAchievementByGameIdAndNameError: function () {
        "use strict";
        var gameId = 2,
            achievementName = "ErrorAchievement";
        this.store.getAchievementByGameIdAndName(gameId, achievementName, getAchievementCallback);

        function getAchievementCallback(error, result) {
            assertNotNull(error);
            assertNull(result);
        }
    }
});
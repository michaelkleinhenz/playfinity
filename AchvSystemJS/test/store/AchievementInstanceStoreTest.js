/*global ACHV*/
TestCase("AchievemenInstanceStoreTest", {
    setUp: function () {
        "use strict";
        var db = {
                insert: function () {},
                destroy: function (docName, revision, callback) {}
            },
            dbMock = mock(db),
            logger = {
                error: function () {}
            },
            conf = {
                "db": dbMock,
                "logger": logger
            };

        when(dbMock).insert(anything()).
            then(function (doc, docName, callback) {
                callback("SomeError", null);
            });

        when(dbMock).destroy(anything()).
            then(function (docName, revision, callback) {
                if (revision === "error_revision") {
                    callback("DestroyError", null);
                } else {
                    callback(null, "Body");
                }
            });

        this.store = ACHV.achievementInstanceStore(conf);
    },

    testCreateOrUpdateAchievementInstanceError: function () {
        "use strict";
        this.store.createOrUpdateAchievementInstance("doc", createOrUpdateAchvInsCallback);

        function createOrUpdateAchvInsCallback(error, result) {
            assertEquals("SomeError", error);
            assertNull(result);
        }
    },

    testDeleteAchievement: function () {
        "use strict";
        this.store.deleteAchievement("docname", "revision", deleteAchievementCallback);

        function deleteAchievementCallback(error, result) {
            assertNull(error);
            assertEquals("Body", result);
        }
    },

    testDeleteAchievementError: function () {
        "use strict";
        this.store.deleteAchievement("docname", "error_revision", deleteAchievementCallback);

        function deleteAchievementCallback(error, result) {
            assertEquals("DestroyError", error);
            assertNull(result);
        }
    }
});
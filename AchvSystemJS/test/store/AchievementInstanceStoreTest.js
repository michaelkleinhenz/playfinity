/*global ACHV*/
TestCase("AchievemenInstanceStoreTest", {
    testCreateOrUpdateAchievementInstanceError: function () {
        "use strict";

        var db = {
                insert: function () {}
            },
            dbMock = mock(db),
            logger = {
                error: function () {}
            },
            conf = {
                "db": dbMock,
                "logger": logger
            },
            store = ACHV.achievementInstanceStore(conf);

        when(dbMock).insert(anything()).
            then(function (doc, docName, callback) {
                callback("SomeError", null);
            });

        store.createOrUpdateAchievementInstance("doc", createOrUpdateAchvInsCallback);

        function createOrUpdateAchvInsCallback(error, result) {
            assertEquals("SomeError", error);
            assertNull(result);
        }
    }
});
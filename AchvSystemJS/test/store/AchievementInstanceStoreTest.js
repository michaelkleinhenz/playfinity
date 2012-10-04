TestCase("AchievementInstanceStoreTest", {

   setUp: function() {
    },

    testCreateAchievementInstance : function() {
        var configuration = {
            "db": "",
            "logger": ""
        };
        var achievementInstanceStore = ACHV.achievementInstanceStore(configuration);
        var doc = {};
        var callback = function (error, body) {};
        achievementInstanceStore.createAchievementInstance(doc, callback);
        assertTrue(true);
    }
});
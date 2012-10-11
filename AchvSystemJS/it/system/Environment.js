SYSTEM = {};

SYSTEM.Environment = function Environment() {};

SYSTEM.Environment.prototype.init = function () {
    // setup achievement engine.
    var achievementEngine = new ACHV.AchievementEngine();
    var oneShotEngine = new ACHV.OneShotEngine();
    achievementEngine.registerEngine(oneShotEngine);

    // create db moock
    var db = {
        view: function() {}
    };
    var dbMock = mock(db);
    when(dbMock).view("achievement_instance", "byGameIdAndUserId").then(
        function(design, view, key, callback) {
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

    // create achivement instance store
    var achvInstanceStoreConf = {
       "logger": "test",
        "db": dbMock
    };
    var achvInstanceStore = ACHV.achievementInstanceStore(achvInstanceStoreConf);

    // create achievement store
    var achvStoreConf = {
        "logger": "test",
        "db": dbMock
    };
    var achvStore = ACHV.achievementStore(achvStoreConf);

    // create achievement system
    var achvSystemConf = {
        "achievementEngines": {},
        "achievementInstanceStore": achvInstanceStore,
        "achievementStore": achvStore
    };
    this.achievementSystem = new ACHV.AchievementSystem(achvSystemConf);
};

SYSTEM.Environment.prototype.getAchievementSystem = function() {
	return this.achievementSystem;
};
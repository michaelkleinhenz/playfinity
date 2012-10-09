SYSTEM = {};

SYSTEM.Environment = function Environment() {};

SYSTEM.Environment.prototype.init = function () {
    var achievementEngine = new ACHV.AchievementEngine();
    var oneShotEngine = new ACHV.OneShotEngine();
    achievementEngine.registerEngine(oneShotEngine);

    var db = {
        view: function() {}
    };
    var dbMock = mock(db);
    when(dbMock).view(anything()).then(function(arg) {
        console.log(arg);
    });

    var achvInstanceStoreConf = {
       "logger": "test",
        "db": dbMock
    };
    var achvInstanceStore = mock(ACHV.achievementInstanceStore(achvInstanceStoreConf));

    var achvStoreConf = {
        "logger": "test",
        "db": dbMock
    };
    var achvStore = mock(ACHV.achievementStore(achvStoreConf));


    var achvSystemConf = {
        "achievementEngine": achievementEngine,
        "achievementInstanceStore": achvInstanceStore,
        "achievementStore": achvStore
    };
    this.achievementSystem = new ACHV.AchievementSystem(achvSystemConf);
};

SYSTEM.Environment.prototype.getAchievementSystem = function() {
	return this.achievementSystem;
};
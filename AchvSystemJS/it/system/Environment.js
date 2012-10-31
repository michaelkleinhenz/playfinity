/*global ACHV*/
SYSTEM = {};

SYSTEM.Environment = function Environment() {};

SYSTEM.Environment.prototype.init = function () {
    // setup achievement engine.
    var eventBus = new EventEmitter(),
        achvEngineConf = {
            "eventBus": eventBus
        },
        achievementEngine = new ACHV.AchievementEngine(achvEngineConf),
        oneShotEngine = new ACHV.OneShotEngine();
    achievementEngine.registerEngine(oneShotEngine);

    // create db moock
    var db = {
            view: function () {},
            insert: function () {}
        },
        dbMock = mock(db);


    function dbViewStartGameAchievement(design, view, key, callback) {
        var startGameAchievement = FIXTURE.getStartGameAchievement(),
            doc = {
                "value" : startGameAchievement
            },
            body = {
                rows: {}
            };

        body.rows.length = 1;
        body.rows.forEach = function(forEachCallBack) {
            forEachCallBack(doc);
        };

        callback(null, body, {});
    }

    when(dbMock).view("achievement_instance", "byGameIdAndUserId").then(dbViewStartGameAchievement);
    when(dbMock).view("achievement", "byGameId").then(dbViewStartGameAchievement);

    when(dbMock).insert(anything(), anything()).then(
        function (doc, docName, callback) {
            callback(null, {}, {});
        }
    );

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
        "achievementStore": achvStore,
        "eventBus": eventBus
    };
    this.achievementSystem = new ACHV.AchievementSystem(achvSystemConf);
};

SYSTEM.Environment.prototype.getAchievementSystem = function() {
	return this.achievementSystem;
};
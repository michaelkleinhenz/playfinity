/*
 * QBadge
 * Questor Achievement System
 *
 * Copyright (c) 2013 Questor GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
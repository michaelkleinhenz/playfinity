global.Utils = require('./util/utils');

var requireDir = require('require-dir');

var hashMap = require('./../libs/hashmap');
var achvEngine = require('./core/AchievementEngine');
var achvSystem = require('./core/AchievementSystem');
var achvStore = require('./store/AchievementStore');
var achvInstanceStore = require('./store/AchievementInstanceStore');
var server = require('./server/Server');
var engineDir = requireDir('./core/engine');


var engines = new hashMap.HashMap();
var achievements = new hashMap.HashMap();

var achvEngineInstance = new achvEngine.AchievementEngine(engines, achievements);

achvEngineInstance.registerEngine(new engineDir.OneShotEngine.OneShotEngine());
achvEngineInstance.registerEngine(new engineDir.CounterEngine.CounterEngine());
achvEngineInstance.registerEngine(engineDir.TimerEngine.timerEngine({"achievementType": "TimerRule"}));
achvEngineInstance.registerEngine(engineDir.StopWatchEngine.stopWatchEngine({"achievementType": "StopWatchRule"}));

var achvSystemConfiguration = {
    "achievementStore":  achvStore.achievementStore(),
    "achievementInstanceStore": achvInstanceStore.achievementInstanceStore(),
    "achievementEngine": achvEngineInstance
};

var achvSystemInstance = new achvSystem.AchievementSystem(achvSystemConfiguration);

server.start(achvSystemInstance);
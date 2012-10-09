// Import modules
global.Utils = require('./util/utils');

var requireDir = require('require-dir');
var logger = require('winston');
var nano = require('nano')('http://127.0.0.1:5984/');

var achvEngine = require('./core/AchievementEngine');
var achvSystem = require('./core/AchievementSystem');
var achvStore = require('./store/AchievementStore');
var achvInstanceStore = require('./store/AchievementInstanceStore');
var server = require('./server/Server');
var engineDir = requireDir('./core/engine');

// Init achievement engine
var achvEngineInstance = new achvEngine.AchievementEngine();
achvEngineInstance.registerEngine(new engineDir.OneShotEngine.OneShotEngine());
achvEngineInstance.registerEngine(new engineDir.CounterEngine.CounterEngine());
achvEngineInstance.registerEngine(engineDir.TimerEngine.timerEngine({"achievementType": "TimerRule"}));
achvEngineInstance.registerEngine(engineDir.StopWatchEngine.stopWatchEngine({"achievementType": "StopWatchRule"}));

// Setup achievement system configuration
var achvStoreConf = {
    "logger": logger,
    "db": nano.use('achievement')
};
var achievementStore = achvStore.achievementStore(achvStoreConf);

var achvInstanceStoreConf = {
    "logger": logger,
    "db": nano.use('achievements_instances')
};
var achievementInstanceStore = achvInstanceStore.achievementInstanceStore(achvInstanceStoreConf);

var achvSystemConfiguration = {
    "achievementStore":  achievementStore,
    "achievementInstanceStore": achievementInstanceStore,
    "achievementEngine": achvEngineInstance
};

// Start achievement system
var achvSystemInstance = new achvSystem.AchievementSystem(achvSystemConfiguration);

server.start(achvSystemInstance);
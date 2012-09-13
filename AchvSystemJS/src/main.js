global.Utils = require('./util/utils');
var hashMap = require('./../libs/hashmap');
var achvEngine = require('./core/AchievementEngine');
var achvSystem = require('./core/AchievementSystem');
var server = require('./server/Server');

var requireDir = require('require-dir');
var engineDir = requireDir('./core/engine');

var engines = new hashMap.HashMap();
var achievements = new hashMap.HashMap();

var achvEngineInstance = new achvEngine.AchievementEngine(engines, achievements);

achvEngineInstance.registerEngine(new engineDir.OneShotEngine.OneShotEngine());
achvEngineInstance.registerEngine(new engineDir.CounterEngine.CounterEngine());
achvEngineInstance.registerEngine(engineDir.TimerEngine.timerEngine({"achievementType": "TimerRule"}));
achvEngineInstance.registerEngine(engineDir.StopWatchEngine.stopWatchEngine({"achievementType": "StopWatchRule"}));

var achvSystemInstance = new achvSystem.AchievementSystem(achvEngineInstance);

server.start(achvSystemInstance);
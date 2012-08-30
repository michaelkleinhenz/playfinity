global.Utils = require('./util/utils');
var hashMap = require('./../libs/hashmap');
var achv = require('./core/Achievement');
var achvEngine = require('./core/AchievementEngine');
var achvSystem = require('./core/AchievementSystem');
var server = require('./server/Server');

var engines = new hashMap.HashMap();
var achievements = new hashMap.HashMap();
var achvEngineInstance = new achvEngine.AchievementEngine(engines, achievements);
var achvSystemInstance = new achvSystem.AchievementSystem(achvEngineInstance);

server.start(achvSystemInstance);
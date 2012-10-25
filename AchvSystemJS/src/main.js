// Import modules
global.ACHV = require('./core/ACHV');
global.Utils = require('./util/utils');

var logger = require('winston');
var nano = require('nano')('http://127.0.0.1:5984/');
var requireDir = require('require-dir');

var EventEmitter = require('../libs/EventEmitter-4.0.2.min').EventEmitter;

requireDir('./core/engine');
require('./core/AchievementEngine');

var achvSystem = require('./core/AchievementSystem');
var achvStore = require('./store/AchievementStore');
var achvInstanceStore = require('./store/AchievementInstanceStore');
var server = require('./server/Server');

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
    "achievementEngines": {},
    "eventBus": new EventEmitter()
};
// Start achievement system
var achvSystemInstance = new achvSystem.AchievementSystem(achvSystemConfiguration);

server.start(achvSystemInstance);
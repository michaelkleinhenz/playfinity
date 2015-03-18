/*
 * Playfinity
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

// Import configuration
require('./config.js');

// Import global utility modules
Utils = require('./service/util/utils');
Async = require('async');
var EventEmitter = require('./service/util/EventEmitter-4.0.2.min.js').EventEmitter;
var logger = require('winston');

// Import data storage
var nano = require('nano')(PlayfinityConfig.couchUrl);

// Create core achievement system class
ACHV = require('./service/achievements/ACHV');
require('require-dir')('./service/achievements/engine');
require('./service/achievements/AchievementProcessor');
require('./service/achievements/AchievementEngine');
var achievementSystem = require('./service/achievements/AchievementSystem');

// Import stores
var achievementInstanceInitializer = require('./service/store/AchievementInstanceInitializer');
var achievementStore = require('./service/store/AchievementStore');
var achievementInstanceStore = require('./service/store/AchievementInstanceStore');
var userStore = require('./service/store/UserStore');
var gameStore = require('./service/store/GameStore');
var storageStore = require('./service/store/StorageStore');
var leaderboardStore = require('./service/store/LeaderboardStore');

// Import server
var server = require('./service/server/Server');

// Create stores
var userStoreInstance = userStore.userStore(nano.use(PlayfinityConfig.userDbName), logger);
var gameStoreInstance = gameStore.gameStore(nano.use(PlayfinityConfig.gameDbName), logger);
var achievementStoreInstance = achievementStore.achievementStore(nano.use(PlayfinityConfig.modelDbName), logger);
var achievementInstanceStoreInstance = achievementInstanceStore.achievementInstanceStore(nano.use(PlayfinityConfig.instanceDbName), logger);
var storageStoreInstance = storageStore.storageStore(nano.use(PlayfinityConfig.storageDbName), logger);
var leaderboardStoreInstance = leaderboardStore.leaderboardStore(nano.use(PlayfinityConfig.leaderboardDbName), logger);

// Create achievement initializer
var achievementInstanceInitializerInstance = achievementInstanceInitializer.achievementInstanceInitializer(achievementStoreInstance, achievementInstanceStoreInstance);

// Create Achievement System - only this is relevant for embedded use!
var achievementSystemInstance = new achievementSystem.AchievementSystem(achievementInstanceStoreInstance, new EventEmitter());

// Start achievement system
server.start(userStoreInstance, gameStoreInstance, achievementStoreInstance, achievementInstanceStoreInstance, storageStoreInstance, leaderboardStoreInstance,
    achievementSystemInstance, achievementInstanceInitializerInstance, logger);

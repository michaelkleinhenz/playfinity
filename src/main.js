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

// Import configuration
require('./config.js');

// Import global utility modules
Utils = require('./util/utils');
Async = require('async');
var EventEmitter = require('./util/EventEmitter-4.0.2.min.js').EventEmitter;
var logger = require('winston');

// Import data storage
var nano = require('nano')(QBadgeConfig.couchUrl);

// Create core achievement system class
ACHV = require('./achievements/ACHV');
require('require-dir')('./achievements/engine');
require('./achievements/AchievementProcessor');
require('./achievements/AchievementEngine');
var achievementSystem = require('./achievements/AchievementSystem');

// Import stores
var achievementInstanceInitializer = require('./store/AchievementInstanceInitializer');
var achievementStore = require('./store/AchievementStore');
var achievementInstanceStore = require('./store/AchievementInstanceStore');
var userStore = require('./store/UserStore');
var gameStore = require('./store/GameStore');

// Import server
var server = require('./server/Server');

// Create stores
var userStoreInstance = userStore.userStore(nano.use(QBadgeConfig.userDbName), logger);
var gameStoreInstance = gameStore.gameStore(nano.use(QBadgeConfig.gameDbName), logger);
var achievementStoreInstance = achievementStore.achievementStore(nano.use(QBadgeConfig.modelDbName), logger);
var achievementInstanceStoreInstance = achievementInstanceStore.achievementInstanceStore(nano.use(QBadgeConfig.instanceDbName), logger);

// Create achievement initializer
var achievementInstanceInitializerInstance = achievementInstanceInitializer.achievementInstanceInitializer(achievementStoreInstance, achievementInstanceStoreInstance);

// Create Achievement System - only this is relevant for embedded use!
var achievementSystemInstance = new achievementSystem.AchievementSystem(achievementInstanceStoreInstance, new EventEmitter());

// Start achievement system
server.start(userStoreInstance, gameStoreInstance, achievementStoreInstance, achievementInstanceStoreInstance,
    achievementSystemInstance, achievementInstanceInitializerInstance, logger);

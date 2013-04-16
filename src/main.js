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

// Import modules
global.ACHV = require('./core/ACHV');
global.Utils = require('./util/utils');
global.async = require('../libs/async.min');

var logger = require('winston');
var nano = require('nano')('http://127.0.0.1:5984/');
var requireDir = require('require-dir');

var EventEmitter = require('../libs/EventEmitter-4.0.2.min').EventEmitter;

requireDir('./core/engine');
require('./core/AchievementProcessor');
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
    "db": nano.use('achievement_instance')
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
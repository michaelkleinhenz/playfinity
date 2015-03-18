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

// configuration
require("./config.js");

// global utils
global.Async = require("async");
global.Logger = require("winston");

// local utils
var express = require("express");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

// init data storage
var nano = require("nano")(PlayfinityConfig.couchUrl);
global.leaderboardDB = nano.use(PlayfinityConfig.leaderboardDbName);

// setup server
var app = express();
app.enable("jsonp callback");
app.use(bodyParser.json());
app.use(cookieParser());

// register service modules
require("./service/HealthRESTService.js").registerServices(app);
require("./service/LeaderboardRESTService.js").registerServices(app);

// Run Server
app.listen(PlayfinityConfig.serverPort, function () {
    Logger.info("Playfinity");
    Logger.info("Copyright (c) 2013, 2014, 2015 Questor GmbH, Berlin");
    Logger.info("Listening on port " + PlayfinityConfig.serverPort);
});

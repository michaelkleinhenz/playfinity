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

var leaderboardStore = require("./store/LeaderboardStore.js");

exports.registerServices = function(app) {
    // update database views
    leaderboardStore.updateDatabaseViews();
    // register routes
    app.post("/leaderboard/:mode", this.addScore);
    app.get("/leaderboard/all/:ownerId/:gameId/:leaderboardId", this.getAllEntries);
    app.get("/leaderboard/game/:ownerId/:gameId/:leaderboardId", this.getLeaderboard);
    app.get("/leaderboard/player/:ownerId/:gameId/:leaderboardId/:userId", this.getPlayerLeaderboardEntry);
    app.delete("/leaderboard/player/:ownerId/:userId", this.setPlayerInactive);
};

exports.addScore = function(req, res) {
    var storeEntry = req.body;
    leaderboardStore.addScore(storeEntry, req.params.mode,
        function(result) {
            res.status(201).json(result);
        },
        function(error) {
            res.send(500, "Error handling request: " + error);
        });
};

exports.getLeaderboard = function(req, res) {
    var ownerId = req.params.ownerId;
    var gameId = req.params.gameId;
    var leaderboardId = req.params.leaderboardId;
    leaderboardStore.getLeaderboard(ownerId, gameId, leaderboardId,
        function(result) {
            res.status(200).json(result);
        },
        function(error) {
            res.send(500, "Error handling request: " + error);
        });
};

exports.getAllEntries = function(req, res) {
    var ownerId = req.params.ownerId;
    var gameId = req.params.gameId;
    var leaderboardId = req.params.leaderboardId;
    leaderboardStore.getAllEntries(ownerId, gameId, leaderboardId,
        function(result) {
            res.status(200).json(result);
        },
        function(error) {
            res.send(500, "Error handling request: " + error);
        });
};

exports.getPlayerLeaderboardEntry = function(req, res) {
    var ownerId = req.params.ownerId;
    var gameId = req.params.gameId;
    var leaderboardId = req.params.leaderboardId;
    var userId = req.params.userId;
    leaderboardStore.getPlayerLeaderboardEntry(ownerId, gameId, leaderboardId, userId,
        function(result) {
            res.status(200).json(result);
        },
        function(error) {
            res.send(500, "Error handling request: " + error);
        });
};

exports.setPlayerInactive = function(req, res) {
    var ownerId = req.params.ownerId;
    var userId = req.params.userId;
    leaderboardStore.setPlayerInactive(ownerId, userId,
        function(result) {
            res.status(200).json(result);
        },
        function(error) {
            res.send(500, "Error handling request: " + error);
        });
};

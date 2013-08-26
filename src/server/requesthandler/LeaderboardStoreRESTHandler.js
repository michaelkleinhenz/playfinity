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

var crypto = require('crypto');

/**
 * Handler for operations on the leaderboards.
 *
 * @param authN
 * @param leaderboardStore
 * @param logger
 * @returns {{}}
 */
leaderboardStoreRESTHandler = function(authN, leaderboardStore, logger) {
    var self = {};
/*
    var leaderboard = {
        leaderboardId: "uniqueid",
        name: {
            de: "DE name",
            en: "EN name"
        },
        type: "absolute"|"time"|"fraction",
        order: "ascending"|"descending",
        ownerId: owner,
        gameId: game
    }

    var entry = {
        leaderboardEntryId: "uniqueid",
        leaderboardId: leaderboardId,
        userId: userId,
        gameId: gameId,
        ownerId: ownerId,
        timestamp: epoch,
        score: value
    }

    // result of POST SCORE
    var resultEntry = {
        leaderboardId: leaderboardId,
        userId: userId,
        gameId: gameId,
        ownerId: ownerId,
        highscore : [
            {
                frame: DAY|WEEK|ALLTIME,
                type: PERSONAL|GLOBAL
            }
        ],
        standing: [
            {
                frame: DAY|WEEK|ALLTIME,
                position: 42
            }
        ]
    }
*/
    self.addScore = function(req, res) {
        // TODO
    }

    self.getPlayerLeaderboard = function(req, res) {
        // TODO
    }

    self.getGlobalLeaderboard = function(req, res) {
        // TODO
    }

    self.deleteLeaderboardByleaderboardId = function(req, res) {
        var userId = req.params.userId;
        var gameId = req.params.gameId;
        var leaderboardId = req.params.leaderboardId;
        leaderboardStore.getLeaderboard(leaderboardId, callback);

        function callback(error, result) {
            if (error || result.length!=1 || result[0].value.userId!=userId || result[0].value.gameId!=gameId) {
                res.send(500);
            } else {
                console.log(result[0].value);
                leaderboardStore.deleteLeaderboard(result[0].value, function(error) {
                    if (error)
                        res.send(500);
                    else
                        res.send(200);
                });
            }
        }
    }

    self.createLeaderboard = function(req, res) {
        var data = req.body;
        Async.series({
            game: function(callback){
                authN.retrieveGame(req.params.gameId, function(result) {
                    callback(null, result);
                });
            },
            user: function(callback){
                authN.retrieveUser(req.params.userId, function(result) {
                    callback(null, result);
                });
            }
        },
        function(err, results){
            if (typeof results.game=="undefined" || typeof results.user=="undefined") {
                res.send(500);
                return;
            }
            if (results.game.ownerId!=results.user.ownerId) {
                res.json(500, "User and game have different owners.");
                return;
            }
            if (results.game.gameId!=results.user.gameId) {
                res.json(500, "User and game are not attached.");
                return;
            }
            var uuid = Utils.hash(Utils.uuid());
            var leaderboard = {
                leaderboardId: uuid,
                ownerId: results.game.ownerId,
                gameId: req.params.gameId,
                userId: req.params.userId,
                timestamp: new Date().getTime(),
                data: data
            };
            leaderboardStore.createOrUpdateleaderboard(leaderboard, callback);
            function callback(error, result) {
                if (error) {
                    res.json(500, error);
                } else
                    delete leaderboard.data;
                    res.json(200, leaderboard);
                }
            });
    }

    return self;
}

exports.leaderboardStoreRESTHandler = leaderboardStoreRESTHandler;
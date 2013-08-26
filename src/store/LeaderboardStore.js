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
 * Operations for access to database leaderboard data.
 *
 * @param db
 * @param logger
 * @returns {{}}
 */
leaderboardStore = function(db, logger) {
    var self = {};

    self.getLeaderboard = function (leaderboardId, callback) {
        db.view('leaderboard', 'byId', {"key": leaderboardId}, function(error, body) {
            if (error) {
                logger.error("Not able to get leaderboard: leaderboardId=" + leaderboardId +
                    ", error=" + JSON.stringify(error));
            }
            callback(error, (typeof body=="undefined")?body:body.rows);
        });
    };

    self.getLeaderboards = function (ownerId, callback) {
        db.view('leaderboard', 'byOwnerId', {"key": ownerId}, function(error, body) {
            if (error) {
                logger.error("Not able to get leaderboard: leaderboardId=" + leaderboardId +
                    ", error=" + JSON.stringify(error));
            }
            callback(error, (typeof body=="undefined")?body:body.rows);
        });
    };

    self.listLeaderboardByGameId = function (gameId, callback) {
        db.view('leaderboard', 'byGameId', {"key": gameId}, function(error, body) {
            if (error) {
                logger.error("Not able to get leaderboard: leaderboardId=" + leaderboardId +
                    ", error=" + JSON.stringify(error));
            }
            callback(error, (typeof body=="undefined")?body:body.rows);
        });
    };

    self.deleteLeaderboard = function (leaderboard, callback) {
        db.destroy(leaderboard._id, leaderboard._rev, function(error, body) {
            if (error) {
                logger.error("Not able to delete leaderboard: leaderboardId=" + leaderboard.id +
                    ", revision=" + leaderboard.revision +
                    ", error" + JSON.stringify(error));
            }
            callback(error);
        });
    };

    self.createOrUpdateLeaderboard = function (leaderboard, callback) {
        leaderboard._id = leaderboard.leaderboardId;
        db.insert(leaderboard, function (error, body, headers) {
            if (error) {
                logger.error("Not able to insert leaderboard" +
                    JSON.stringify(leaderboard) + " Reason:" + error);
            }
            callback(error);
        });
    };

    self.deleteLeaderboardEntry = function (leaderboardEntry, callback) {
        db.destroy(leaderboardEntry._id, leaderboardEntry._rev, function(error, body) {
            if (error) {
                logger.error("Not able to delete leaderboard: leaderboardId=" + leaderboardEntry.id +
                    ", revision=" + leaderboardEntry.revision +
                    ", error" + JSON.stringify(error));
            }
            callback(error);
        });
    };

    self.createOrUpdateLeaderboardEntry = function (leaderboardEntry, callback) {
        leaderboardEntry._id = leaderboardEntry.leaderboardId;
        db.insert(leaderboardEntry, function (error, body, headers) {
            if (error) {
                logger.error("Not able to insert leaderboard" +
                    JSON.stringify(leaderboardEntry) + " Reason:" + error);
            }
            callback(error);
        });
    };

    return self;
}

exports.leaderboardStore = leaderboardStore;
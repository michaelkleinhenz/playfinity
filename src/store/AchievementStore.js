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

/*
 * Functions for operations on model data.
 */

/*global ACHV*/
ACHV.achievementStore = function (conf) {
    "use strict";
    var db = conf.db,
        logger = conf.logger,
        self = {};

    self.getAchievementsForGameId = function (gameId, callback) {
        db.view('achievement', 'byGameId', {"key": gameId}, callback);
    };

    self.getAchievementsByOwnerIdAndGameId = function (ownerId, gameId, callback) {
        db.view('achievement', 'byOwnerIdAndGameId', {"key": [ownerId, gameId]}, getAchievementCallback);

        function getAchievementCallback(error, body) {
            if (error) {
                logger.error("Not able to get achievement: ownerId=" + ownerId +
                    ", gameId=" + gameId +
                    ", error=" + JSON.stringify(error));
            }
            callback(error, body.rows);
        }
    };

    self.getAchievementsByOwnerId = function (ownerId, callback) {
        db.view('achievement', 'byOwnerId', {"key": ownerId}, getAchievementCallback);

        function getAchievementCallback(error, body) {
            if (error) {
                logger.error("Not able to get achievement: ownerId=" + ownerId +
                    ", error=" + JSON.stringify(error));
            }
            callback(error, body.rows);
        }
    };

    self.getAchievementById = function (id, callback) {
        db.view('achievement', 'byId', {"key": id}, getAchievementCallback);
        function getAchievementCallback(error, body) {
            if (error) {
                logger.error("Not able to get achievement: id=" + id +
                    ", error=" + JSON.stringify(error));
            }
            callback(error, body.rows);
        }
    };

    self.deleteAchievement = function (name, revision, callback) {
        db.destroy(name, revision, deleteAchievementCallback);

        function deleteAchievementCallback(error, body) {
            if (error) {
                logger.error("Not able to delete achievement: name=" + name +
                    ", revision=" + revision +
                    ", error" + JSON.stringify(error));
            }
            callback(error, body);
        }
    };

    self.getAchievementByGameIdAndName = function (gameId, name, callback) {
        db.view('achievement', 'byGameIdAndName', {"key": [gameId, name]}, getAchievementCallback);

        function getAchievementCallback(error, body) {
            if (error) {
                logger.error("Not able to get achievement: gameId=" + gameId +
                    ", name=" + name +
                    ", error=" + JSON.stringify(error));
            }
            callback(error, body);
        }
    };

    self.getAchievementNamesByOwnerIdAndGameId = function (ownerId, gameId, callback) {
        db.view('achievement', 'nameByOwnerIdAndGameId', {"key": [ownerId, gameId]}, getAchievementCallback);

        function getAchievementCallback(error, body) {
            if (error) {
                logger.error("Not able to get achievement names: ownerId=" + ownerId +
                    ", gameId=" + gameId +
                    ", error=" + JSON.stringify(error));
            }
            callback(error, body.rows);
        }
    };

    self.getAchievement = function (ownerId, gameId, name, callback) {
        db.view('achievement', 'byOwnerIdAndGameIdAndName', {"key": [ownerId, gameId, name]}, getAchievementCallback);

        function getAchievementCallback(error, body) {
            if (error) {
                logger.error("Not able to get achievement names: ownerId=" + ownerId +
                    ", gameId=" + gameId +
                    ", error=" + JSON.stringify(error));
            }
            var result = {};
            if (body.rows.length > 0) {
                result = body.rows[0].value;
            }
            callback(error, result);
        }
    };
    return self;
};

exports.achievementStore = ACHV.achievementStore;
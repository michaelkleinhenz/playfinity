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

/**
 * REST handler for operations on achievement model data. Needs configuration with "achievementStore" and "logger".
 *
 * @param achievementStore
 * @param logger
 * @returns {{}}
 */
achievementRESTHandler = function(achievementStore, logger) {
    var self = {};

    self.createAchievement = function(req, res, next) {
        var doc = req.body;
        logger.info('createAchievement(' + JSON.stringify(doc) + ')' );
        achievementStore.createAchievement(doc, function (error, result) {
            if (error) {
                res.send(404);
                logger.error("Not able to insert " + doc + " Reason:" + error);
            } else {
                logger.debug(JSON.stringify(result));
                res.json(200, result);
            }
        });
    }

    self.getAchievementsForGameId = function(req, res, next) {
        var gameId = req.params.gameId;
        achievementStore.getAchievementsForGameId(gameId, callback);

        function callback(error, body, headers) {
            if(error) {
                logger.error("Not able to load documents: " + error);
                res.send(404);
            } else {
                res.json(200, body);
            }
        }
    }

    self.deleteAchievement = function(req, res, next) {
        var name = req.params.achievementName,
            revision = req.params.revision;
        achievementStore.deleteAchievement(name, revision, callback);

        function callback(error, result) {
            if (error) {
                res.json(404, error);
            } else {
                res.json(200, result);
            }
        }
    }

    self.getAchievementByGameIdAndName = function(req, res, next) {
        var gameId = req.params.gameId,
            name = req.params.achievementName;
        achievementStore.getAchievementByGameIdAndName(gameId, name, callback);

        function callback(error, result) {
            if (error) {
                res.json(404, error);
            } else {
                res.json(200, result);
            }
        }
    }

    self.getAchievementsByOwnerIdAndGameId = function(req, res, next) {
        var gameId = req.params.gameId,
            ownerId = req.params.ownerId;
        achievementStore.getAchievementsByOwnerIdAndGameId(ownerId, gameId, callback);

        function callback(error, result) {
            if (error) {
                res.json(404, error);
            } else {
                if (req.query.callback) {
                    res.send(200, req.query.callback + '(' + JSON.stringify(result) + ');');
                } else {
                    res.json(200, result);
                }
            }
        }
    }

    self.getAchievementNamesByOwnerIdAndGameId = function(req, res, next) {
        var gameId = req.params.gameId,
            ownerId = req.params.ownerId;
        achievementStore.getAchievementNamesByOwnerIdAndGameId(ownerId, gameId, callback);

        function callback(error, result) {
            if (error) {
                res.json(404, error);
            } else {
                if (req.query.callback) {
                    res.send(200, req.query.callback + '(' + JSON.stringify(result) + ');');
                } else {
                    res.json(200, result);
                }
            }
        }
    }

    return self;
}

exports.achievementRESTHandler = achievementRESTHandler
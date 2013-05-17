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
 * REST handler for operations on achievement instance data. Needs configuration with
 * "achievementInstanceStore", "achievementInstanceInitializer" and "logger".
 *
 * @param achievementInstanceStore
 * @param achievementInstanceInitializer
 * @param logger
 * @returns {{}}
 */
achievementInstanceRESTHandler = function(achievementInstanceStore, achievementInstanceInitializer, logger) {
    var self = {};

    self.getAchievementInstancesByGameIdAndUserId = function(req, res, next) {
        var userId = req.params.userId,
            gameId = req.params.gameId;
        achievementInstanceStore.getAchievementsForGameIdAndUserId(gameId, userId, callback);

        function callback(error, result) {
            if (error) {
                res.json(404, error);
            } else {
                if (req.query.callback) {
                    res.send(200, req.query.callback + '(' + JSON.stringify(result.rows) + ');');
                } else {
                    res.json(200, result.rows);
                }
            }
        }
    }

    self.getUnlockedAchievementsByGameIdAndUserId = function(req, res, next) {
        var userId = req.params.userId,
            gameId = req.params.gameId;
        achievementInstanceStore.getUnlockedAchievementsForGameIdAndUserId(gameId, userId, callback);

        function callback(error, result) {
            if (error) {
                res.json(404, error);
            } else {
                if (req.query.callback) {
                    res.send(200, req.query.callback + '(' + JSON.stringify(result.rows) + ');');
                } else {
                    res.json(200, result.rows);
                }
            }
        }
    }

    self.initAchievementInstances = function (req, res, next) {
        var id = {
            "ownerId": req.params.ownerId,
            "gameId": req.params.gameId,
            "userId": req.params.userId
        };
        achievementInstanceInitializer.initAchievementInstances(id, callback);

        function callback(error, result) {
            if (error) {
                res.json(500, error);
            } else {
                res.json(200, result);
            }
        }
    }

    return self;
}

exports.achievementInstanceRESTHandler = achievementInstanceRESTHandler;
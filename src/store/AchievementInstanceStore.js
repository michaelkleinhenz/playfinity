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
 * Functions for operations on instance data.
 */

ACHV.achievementInstanceStore = function (conf) {
    "use strict";
    var logger = conf.logger,
        db = conf.db,
        self = {};

    self.createOrUpdateAchievementInstance = function (doc, callback) {
        db.insert(doc, function (error, body, headers) {
            if (error) {
                logger.error("AchievementInstanceStore.createOrUpdateAchievementInstance() - Not able to insert " +
                    JSON.stringify(doc) + " Reason:" + error);
            }
            callback(error, body);
        });
    };

    self.getAchievementsForGameIdAndUserId = function (gameId, userId, callback) {
        db.view('achievement_instance', 'byGameIdAndUserId', {"key": [gameId, userId]}, function (error, body) {
            if (error) {
                logger.error("Not able to get achievements: gameId=" + gameId + ", userId=" + userId +
                    " error=" + error);
            }
            callback(error, body);
        });
    };

    self.getUnlockedAchievementsForGameIdAndUserId = function (gameId, userId, callback) {
        db.view('achievement_instance', 'byLockedAndGameIdAndUserId', {"key": [false, gameId, userId]},
                function (error, body) {
                    if (error) {
                        logger.error("Not able to get unlocked achievements: gameId=" + gameId + ", userId=" + userId +
                            " error=" + error);
                    }
                    callback(error, body);
                });
    };

    self.deleteAchievement = function (documentName, revision, callback) {
        db.destroy(documentName, revision, function (error, body) {
            if (error) {
                logger.error("Not able to delete: documentName=" + documentName + ", revision=" + revision +
                    ", error=" + error);
            }
            callback(error, body);
        });
    };

    return self;
};
exports.achievementInstanceStore = ACHV.achievementInstanceStore;
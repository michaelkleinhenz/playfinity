/*global ACHV*/
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
/*global ACHV*/
ACHV.achievementInstanceStore = function (conf) {
    "use strict";
    var logger = conf.logger,
        db = conf.db,
        self = {};

    self.createOrUpdateAchievementInstance = function (doc, callback) {
        db.insert(doc, doc.name, function (error, body, headers) {
            if (error) {
                logger.error("Not able to insert " + doc + " Reason:" + error);
            }
            callback(error, body);
        });
    };

    self.getAchievementsForGameIdAndUserId = function (gameId, userId, callback) {
        db.view('achievement_instance', 'byGameIdAndUserId', {"key": [gameId, userId]}, callback);
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
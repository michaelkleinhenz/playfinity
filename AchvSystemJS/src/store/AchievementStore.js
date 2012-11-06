/*global ACHV*/
ACHV.achievementStore = function (conf) {
    "use strict";
    var db = conf.db,
        logger = conf.logger,
        self = {};

    self.getAchievementsForGameId = function (gameId, callback) {
        db.view('achievement', 'byGameId', {"key": gameId}, callback);
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

    return self;
};

exports.achievementStore = ACHV.achievementStore;
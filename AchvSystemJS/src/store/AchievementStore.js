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
                    ", error=" + JSON().stringify(error));
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
/*global ACHV*/
ACHV.achievementStore = function (conf) {
    "use strict";
    var db = conf.db,
        logger = conf.logger,
        self = {};

    self.getAchievementsForGameId = function (gameId, callback) {
        db.view('achievement', 'byGameId', {"key": gameId}, callback);
    };

    return self;
};

exports.achievementStore = ACHV.achievementStore;
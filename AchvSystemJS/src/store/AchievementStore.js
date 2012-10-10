ACHV.achievementStore = function(conf) {
    var db = conf.db;
    var logger = conf.logger;

    var self = {};

    self.getAchievementsForGameId = function (gameId, callback) {
        db.view('achievement', 'byGameId', {"key": gameId}, callback);
    };

    return self;
};

exports.achievementStore = ACHV.achievementStore;
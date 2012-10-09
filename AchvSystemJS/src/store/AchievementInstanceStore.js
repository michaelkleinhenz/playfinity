ACHV.achievementInstanceStore = function(conf) {
    var logger = conf.logger;
    var db = conf.db;

    var self = {};

    self.createAchievementInstance = function (doc, callback) {
        db.insert(doc, doc.name, function(error, body, headers) {
            if(error) {
               logger.error("Not able to insert " + doc + " Reason:" + error);
            }
            callback(error, body);
        });
    };

    self.getAchievementsForGameIdAndUserId = function(gameId, userId, callback) {
        db.view('achievement_instance', 'byGameIdAndUserId', {"key": [gameId, userId]}, callback);
    };

    return self;
};
exports.achievementInstanceStore = ACHV.achievementInstanceStore;
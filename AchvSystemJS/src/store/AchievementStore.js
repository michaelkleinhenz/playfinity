var logger = require('winston');
var nano = require('nano')('http://127.0.0.1:5984/');
var db = nano.use('achievement');

ACHV.achievementStore = function() {

    var self = {};

    self.getAchievementsForGameId = function (gameId, callback) {
        db.view('achievement', 'byGameId', {"key": gameId}, callback);
    };

    return self;
};

exports.achievementStore = ACHV.achievementStore;
var logger = require('winston');
var nano = require('nano')('http://127.0.0.1:5984/');
var db = nano.use('achievement');

ACHV.achievementStore = function() {

    var self = {};

    self.getAchievementsForGameId = function (gameId, callback) {
        db.view('achievement', 'getByGameId', gameId, function(error, body) {
           if(!error) {
               body.rows.forEach(function(doc) {
                    console.log(doc);
               });
           }
        });
    };

    return self;
};

exports.achievementStore = ACHV.achievementStore;
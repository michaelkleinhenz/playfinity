var logger = require('winston');
var nano = require('nano')('http://127.0.0.1:5984/');
var db = nano.use('achievements_instances');

ACHV.achievementInstanceStore = function(configuration) {

    var self = {};

    self.createAchievementInstance = function (doc, callback) {
        db.insert(doc, doc.name, function(error, body, headers) {
            if(error) {
               logger.error("Not able to insert " + doc + " Reason:" + error);
            }
            callback(error, body);
        });
    };

    return self;
};
exports.achievementInstanceStore = ACHV.achievementInstanceStore;
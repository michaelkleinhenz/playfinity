var express = require('express');
var logger = require('winston');
var nano = require('nano')('http://localhost:5984');

var db_name = "achievement";
var db = nano.use(db_name);

var app = module.exports = express();

function readAchievement(req, res, next) {
    logger.info('readAchievement()');
    db.get("myAchievement", function(err, body) {
        if(!err) {
            res.json(200, body);
        } else {
            res.send(404);
        }
    });
}

function createAchievement(req, res, next) {
    logger.info('createAchievement()');
    var doc = {"name": "myAchievement"};
    db.insert(doc, doc.name, function(error, http_body, http_headers) {
        if (error) {
            if(error.message === 'no_db_file') {
                return nano.db.create(db_name, function() {
                    db.insert(doc, doc.name, function(error, http_body, http_headers){
                       return logger.error("Not able to insert " + doc + "Reason: " + error);
                    });
                })
            } else {
                return logger.error("Not able to insert " + doc + " Reason: " + error);
            }
        }
        logger.debug(JSON.stringify(http_body));
    });
    res.status(204);
	res.send();
}

// Setup routes
app.get('/', readAchievement);
app.put('/', createAchievement);

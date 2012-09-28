var express = require('express');
var logger = require('winston');
var nano = require('nano')('http://localhost:5984');
var serializer = require('serializer');

var db_name = "achievement";
var db = nano.use(db_name);

var app = module.exports = express();

function readAchievements(req, res, next) {
    logger.info('readAchievements()');
    db.list(function(error, body) {
        if (!error) {
            res.json(200, body.rows);
        } else {
            res.send(404);
        }
    });
}

function readAchievement(req, res, next) {
    if (req.headers["authorization"] && req.headers["authorization"].indexOf('Bearer ') == 0) {
        var accessToken = getAccessToken(req.headers["authorization"]);
        var data = parseAccessToken(accessToken);

        var achievementName = req.params.achievementName;
        logger.info('readAchievement(' + achievementName + ')' );
        db.get(achievementName, function(err, body) {
            if(!err) {
                logger.debug("response:" + JSON.stringify(body));
                res.json(200, body);
            } else {
                res.send(404);
            }
        });

        function getAccessToken(authorizationHeader) {
            var accessToken = authorizationHeader.replace("Bearer","").trim();
            logger.debug("accessToken=" + accessToken);
            return accessToken;
        }

        function parseAccessToken(accessToken) {
            var mySerializer = serializer.createSecureSerializer("Crypt_Key", "Sign_Key"); // TODO use real keys and extract
            var data = mySerializer.parse(accessToken);
            logger.debug("data=" + JSON.stringify(data));
        }
    } else {
        res.send(401);
    }
}

function createAchievement(req, res, next) {
    var doc = req.body;
    logger.info('createAchievement(' + JSON.stringify(doc) + ')' );
    db.insert(doc, doc.name, function(error, body, headers) {
       if(error) {
           res.send(404);
           logger.error("Not able to insert " + doc + " Reason:" + error);
       }
       logger.debug(JSON.stringify(body));
       res.send(204);
    });
}

// Setup routes
app.get('/', readAchievements);
app.get('/:achievementName', readAchievement);
app.put('/', createAchievement);

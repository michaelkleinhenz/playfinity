var http = require('http');
var express = require('express');
var logger = require('winston');
var nano = require('nano')('http://localhost:5984');
var serializer = require('serializer');
var achievementStore = require('./AchievementStore');

var db_name = "achievement";
var db = nano.use(db_name);

var achvStoreConf = {
    "db": db,
    "logger": logger
};

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

        validateAccessToken(accessToken, sendResponse);

        function sendResponse(error) {
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
        }

        function getAccessToken(authorizationHeader) {
            var accessToken = authorizationHeader.replace("Bearer","").trim();
            logger.debug("accessToken=" + accessToken);
            return accessToken;
        }

        function validateAccessToken(accessToken, sendResponse) {
            callValidationServer(accessToken, isValid);

            function isValid(error, data) {
                var responseJson = JSON.parse(data);
                logger.debug(responseJson + responseJson.valid);
                if(responseJson.valid) {
                    logger.debug("AccessToken is valid.");
                    parseAccessToken(accessToken);
                    sendResponse(error);
                } else {
                    logger.debug("AccessToken is not valid.");
                    res.send(401);
                }
            }

            function callValidationServer(accessToken, isValid) {
                var options = {
                    host: '127.0.0.1',
                    path: '/oauth/validate/' + accessToken,
                    port: '8080',
                    method: 'GET'
                };

                var callback = function(response) {
                    var str = '';
                    response.on('data', function (chunk) {
                        str += chunk;
                    });

                    response.on('end', function() {
                        logger.debug("callValidationServer:" + str);
                        isValid(null, str);
                    });
                };

                var req = http.request(options, callback).end();
            }

            function parseAccessToken(accessToken) {
                var mySerializer = serializer.createSecureSerializer("Crypt_Key", "Sign_Key"); // TODO use real keys and extract
                var data = mySerializer.parse(accessToken);
                logger.debug("data=" + JSON.stringify(data));
            }
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

function getAchievementsForGameId(req, res, next) {
    var gameId = parseInt(req.params.gameId);
    achievementStore.achievementStore(achvStoreConf).getAchievementsForGameId(gameId, callback);

    function callback(error, body, headers) {
        if(error) {
            logger.error("Not able to load documents: " + error);
            res.send(404);
        } else {
            res.json(200, body);
        }
    }
}

function deleteAchievement(req, res, next) {
    var name = req.params.achievementName,
        revision = req.params.revision;
    achievementStore.achievementStore(achvStoreConf).deleteAchievement(name, revision, callback);

    function callback(error, result) {
        if (error) {
            res.json(404, error);
        } else {
            res.json(200, result);
        }
    }
}

// Setup routes
app.get('/', readAchievements);
app.get('/:achievementName', readAchievement);
app.del('/:achievementName/:revision', deleteAchievement);
app.put('/', createAchievement);
app.get('/achievements/:gameId', getAchievementsForGameId);
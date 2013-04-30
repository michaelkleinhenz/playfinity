/*
 * QBadge
 * Questor Achievement System
 *
 * Copyright (c) 2013 Questor GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * Routes for CRUD ops on models and instances. Handles all request/response stuff.
 */

var http = require('http');
var express = require('express');
var logger = require('winston');
var nano = require('nano')('http://localhost:5984');
var serializer = require('serializer');
var achievementStore = require('./AchievementStore'),
    achievementInstanceStore = require('./AchievementInstanceStore'),
    achievementInstanceInitializer = require('./AchievementInstanceInitializer'),
    achvModelDBName = "achievement",
    achvModelDB = nano.use(achvModelDBName),
    achvStoreConf = {
        "db": achvModelDB,
        "logger": logger
    },
    achvInstanceDBName = "achievement_instance",
    achvInstanceDB = nano.use(achvInstanceDBName),
    achvInstanceStoreConf = {
        "db": achvInstanceDB,
        "logger": logger
    },
    achvInstanceStore = achievementInstanceStore.achievementInstanceStore(achvInstanceStoreConf),
    achvInitConf = {
        "achvModelStore": achievementStore.achievementStore(achvStoreConf),
        "achvInstanceStore": achvInstanceStore
    };

var app = module.exports = express();

function readAchievements(req, res, next) {
    "use strict";
    logger.info('readAchievements()');
    logger.debug("jsonp callback: " + req.query.callback);
    achvModelDB.list(function (error, body) {
        if (!error) {
            if (req.query.callback) {
                res.send(200, req.query.callback + '({ "rows": ' + JSON.stringify(body.rows) + '});');
            } else {
                res.json(200, body.rows);
            }
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
            achvModelDB.get(achievementName, function(err, body) {
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
    "use strict";
    var doc = req.body;
    logger.info('createAchievement(' + JSON.stringify(doc) + ')' );
    achvModelDB.insert(doc, function (error, body, headers) {
        if (error) {
            res.send(404);
            logger.error("Not able to insert " + doc + " Reason:" + error);
        }
        logger.debug(JSON.stringify(body));
        res.json(200, body);

    });
}

function getAchievementsForGameId(req, res, next) {
    var gameId = req.params.gameId;
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

function getAchievementByGameIdAndName(req, res, next) {
    "use strict";
    var gameId = req.params.gameId,
        name = req.params.achievementName;
    achievementStore.achievementStore(achvStoreConf).getAchievementByGameIdAndName(gameId, name, callback);

    function callback(error, result) {
        if (error) {
            res.json(404, error);
        } else {
            res.json(200, result);
        }
    }
}

function getAchievementsByOwnerIdAndGameId(req, res, next) {
    "use strict";
    var gameId = req.params.gameId,
        ownerId = req.params.ownerId;
    achievementStore.achievementStore(achvStoreConf).getAchievementsByOwnerIdAndGameId(ownerId, gameId, callback);

    function callback(error, result) {
        if (error) {
            res.json(404, error);
        } else {
            if (req.query.callback) {
                res.send(200, req.query.callback + '(' + JSON.stringify(result) + ');');
            } else {
                res.json(200, result);
            }
        }
    }
}

function getAchievementNamesByOwnerIdAndGameId(req, res, next) {
    "use strict";
    var gameId = req.params.gameId,
        ownerId = req.params.ownerId;
    achievementStore.achievementStore(achvStoreConf).getAchievementNamesByOwnerIdAndGameId(ownerId, gameId, callback);

    function callback(error, result) {
        if (error) {
            res.json(404, error);
        } else {
            if (req.query.callback) {
                res.send(200, req.query.callback + '(' + JSON.stringify(result) + ');');
            } else {
                res.json(200, result);
            }
        }
    }
}

function getAchievementInstancesByGameIdAndUserId(req, res, next) {
    "use strict";
    var userId = req.params.userId,
        gameId = req.params.gameId;
    achvInstanceStore.getAchievementsForGameIdAndUserId(gameId, userId, callback);

    function callback(error, result) {
        if (error) {
            res.json(404, error);
        } else {
            if (req.query.callback) {
                res.send(200, req.query.callback + '(' + JSON.stringify(result.rows) + ');');
            } else {
                res.json(200, result.rows);
            }
        }
    }
}

function getUnlockedAchievementsByGameIdAndUserId(req, res, next) {
    "use strict";
    var userId = req.params.userId,
        gameId = req.params.gameId;
    achvInstanceStore.getUnlockedAchievementsForGameIdAndUserId(gameId, userId, callback);

    function callback(error, result) {
        if (error) {
            res.json(404, error);
        } else {
            if (req.query.callback) {
                res.send(200, req.query.callback + '(' + JSON.stringify(result.rows) + ');');
            } else {
                res.json(200, result.rows);
            }
        }
    }
}

function getAchievement(req, res, next) {
    "use strict";
    var gameId = req.params.gameId,
        ownerId = req.params.ownerId,
        name = req.params.achievementName;

    achievementStore.achievementStore(achvStoreConf).getAchievement(ownerId, gameId, name, callback);

    function callback(error, result) {
        if (error) {
            res.json(404, error);
        } else {
            if (req.query.callback) {
                res.send(200, req.query.callback + '(' + JSON.stringify(result) + ');');
            } else {
                res.json(200, result);
            }
        }
    }
}

/**
 * Creates achievement instances from the achievement models for the requested owner, game and user.
 * Therefore this method must be called before the game starts to trigger events.
 *
 * @param req.params.ownerId - The identification of the owner
 * @param req.params.gameId - The identification of the game
 * @param req.params.userId - The idendification of the user
 */
function initAchievementInstances(req, res, next) {
    "use strict";
    var id = {
        "ownerId": req.params.ownerId,
        "gameId": req.params.gameId,
        "userId": req.params.userId
    };
    achievementInstanceInitializer.achievementInstanceInitializer(achvInitConf).initAchievementInstances(id, callback);

    function callback(error, result) {
        if (error) {
            res.json(500, error);
        } else {
            res.json(200, result);
        }
    }
}

// Configuration
app.enable("jsonp callback");

// Setup routes

// create achievement model
app.put ('/model', createAchievement);

// retrieve model data for owner and game
app.get ('/model/:ownerId/:gameId', getAchievementsByOwnerIdAndGameId);

// init model for owner, game and user
app.post('/model/:ownerId/:gameId/:userId', initAchievementInstances);

// retrieve instance state data for game and user
app.get ('/instance/:gameId/:userId', getAchievementInstancesByGameIdAndUserId);

// retrieve unlocked achievements for game and user
app.get('/unlocked/:gameId/:userId', getUnlockedAchievementsByGameIdAndUserId);

/*
app.get('/', readAchievements);
app.get('/:achievementName', readAchievement);
app.del('/achievements/:achievementName/:revision', deleteAchievement);
app.get('/achievements/:gameId', getAchievementsForGameId);
app.get('/achievements/:ownerId/:gameId/name', getAchievementNamesByOwnerIdAndGameId);
app.get('/achievements/:ownerId/:gameId/:achievementName', getAchievement);
app.get('/achievements/:gameId/:achievementName', getAchievementByGameIdAndName);
*/
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

var authService = require("../auth/authService");
var store = require('./../store/Store');

var express = require('express');
var winston = require('winston');
var fs = require('fs');
var crypto = require('crypto');

function start(userStore, gameStore, achvSystem) {

    function getIndexHtml(req, res, next) {
        // FIXME broken, pages does not exist
        fs.readFile('pages/index.html', function (err, data) {
            res.writeHead(200, {'Content-Type': 'text/html', 'Content-Length': data.length});
            res.write(data);
            res.end();
        });
    }

    function triggerEvent(req, res, next) {
        var event = {
            "tsInit": new Date().getTime(),
            "eventId": req.params.eventId,
            "gameId": req.params.gameId,
            "userId": req.params.userId
        };
        if (!event.tsInit) {
            event.tsInit =  Date.now() / 1000;
        }
        achvSystem.triggerEvent(event, function (achievement) {
            //winston.debug(JSON.stringify(achievement));
        });
        res.status(204);
        res.send();
    }

    function validParams(req, res, keys) {
        // make sure the token fields match the request fields
        var decodedToken = authN.splitAuthToken(req.param("auth"));
        for (var key in keys) {
            if (decodedToken==null || decodedToken[key]!=req.params[key]) {
                winston.info("Request denied: token fields do not match request fields.");
                res.statusCode = 401;
                res.end('Unauthorized');
                return false;
            }
        }
        return true;
    }

    function cors(req, res, next) {
        //console.log("cors headers" + JSON.stringify(req.headers));
        //console.log("req.method=" + req.method);
        //console.log("cors body" + JSON.stringify(req.body));
        var oneof = false;
        if (req.headers.origin) {
            //console.log("req.headers.origin=" + req.headers.origin);
            res.set('Access-Control-Allow-Origin', req.headers.origin);
            res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE, HEAD');
            res.set('Access-Control-Allow-Headers', 'Content-Type, *');
            oneof = true;
        }
        if (req.headers['access-control-request-method']) {
            res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
            oneof = true;
        }
        if (req.headers['access-control-request-headers']) {
            res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
            oneof = true;
        }
        if (oneof) {
            res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
        }

        // intercept OPTIONS method
        if (oneof && req.method == 'OPTIONS') {
            //console.log("cors intercept OPTIONS");
            res.send(200);
        } else {
            next();
        }
    }

    // setup authN
    var authN = new authService.AuthService(userStore, gameStore);

    // setup server
    var app = express();
    app.enable("jsonp callback");
    app.use(express.bodyParser());
    app.set('name', 'Service');

    // create example user and game if in debug mode
    if (QBadgeConfig.debugMode) {
        var exampleUser = {
            nonces: {"1234567890": (new Date().getTime())},
            apiKey: crypto.createHash('sha256').update("user"+new Date().getTime()).digest("hex"),
            userId: "developer"
        };
        var exampleGame = {
            apiKey: crypto.createHash('sha256').update("game"+new Date().getTime()).digest("hex"),
            gameId: "mygame"
        };
        userStore.createOrUpdateUser(exampleUser, function(error, body) {
            winston.debug("Example user created.");
        });
        gameStore.createOrUpdateGame(exampleGame, function(error, body) {
            winston.debug("Example game created.");
        });
        authN.createAuthToken(exampleUser.userId, exampleGame.gameId, new Date().getTime(), new Date().getTime(), function(token) {
            // check the generated token with the verify algorithm to make sure the system works nominal
            authN.verifyAuthToken(token, function(result, msg) {
                if (result) {
                    winston.debug("Running in debug mode. Use the following auth token dispenser to get tokens for demo queries:");
                    winston.debug("http://localhost:" + QBadgeConfig.serverPort + "/token");
                }
                else
                    winston.debug("Token verification check failed: " + msg);
            })
        });
        // create token dispenser route
        app.get('/token', function(req, res, next) {
            authN.createAuthToken(exampleUser.userId, exampleGame.gameId, new Date().getTime(), new Date().getTime(), function(token) {
                res.json(200, token);
            });
        });
    }

    // enable cors
    app.use(cors);

    // setup OAuth
    //app.use('/oauth', require('./../oauth/Oauth'));

    // setup store calls

    app.put('/store/model', function(req, res, next) {
        var doc = req.body;
        var decodedToken = authN.splitAuthToken(req.param("auth"));
        if (decodedToken.userId!=doc.ownerId || decodedToken.gameId!=doc.gameId) {
            winston.info("Request denied: token fields do not match request fields.");
            res.statusCode = 401;
            res.end('Unauthorized');
        } else
            authN.verifyExpressRequest(req, res, next);
    }, store.createAchievement);

    app.get('/store/model/:ownerId/:gameId', function(req, res, next) {
        var decodedToken = authN.splitAuthToken(req.param("auth"));
        if (decodedToken.userId!=req.params.ownerId || decodedToken.gameId!=req.params.gameId) {
            winston.info("Request denied: token fields do not match request fields.");
            res.statusCode = 401;
            res.end('Unauthorized');
        } else
            authN.verifyExpressRequest(req, res, next);
    }, store.getAchievementsByOwnerIdAndGameId);

    app.get('/store/model/:ownerId/:gameId/:userId', function(req, res, next) {
        var doc = req.body;
        var decodedToken = authN.splitAuthToken(req.param("auth"));
        if (decodedToken.userId!=req.params.ownerId || decodedToken.gameId!=req.params.gameId) {
            winston.info("Request denied: token fields do not match request fields.");
            res.statusCode = 401;
            res.end('Unauthorized');
        } else
            authN.verifyExpressRequest(req, res, next);
    }, store.initAchievementInstances);

    app.get('/store/instance/:gameId/:userId', function(req, res, next) {
        if (validParams(req, res, ["userId", "gameId"]))
            authN.verifyExpressRequest(req, res, next);
    }, store.getAchievementInstancesByGameIdAndUserId);

    app.get('/store/unlocked/:gameId/:userId', function(req, res, next) {
        if (validParams(req, res, ["userId", "gameId"]))
            authN.verifyExpressRequest(req, res, next);
    }, store.getUnlockedAchievementsByGameIdAndUserId);

    // setup event call

    app.get('/event/:gameId/:userId/:eventId', function(req, res, next) {
        if (validParams(req, res, ["userId", "gameId"]))
            authN.verifyExpressRequest(req, res, next);
    }, triggerEvent);

    // Setup static html route
    app.get('/', getIndexHtml);

    // Run Server
    app.listen(QBadgeConfig.serverPort, function () {
        winston.info("QBadge Achievement System");
        winston.info("Copyright (c) 2013 Questor GmbH, Berlin");
        winston.info(app.get('name') + " listening at port " + QBadgeConfig.serverPort);
    });
}

exports.start = start;

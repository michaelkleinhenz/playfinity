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

var express = require('express');
var winston = require('winston');
var fs = require('fs');
var crypto = require('crypto');

function start(userStore, gameStore, achvSystem) {

    function getIndexHtml(req, res, next) {
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
            winston.debug(JSON.stringify(achievement));
        });
        res.status(204);
        res.send();
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

    // create example user and game if in debug mode
    if (QBadgeConfig.debugMode) {
        var exampleUser = {
            nonces: {"1234567890": (new Date().getTime())},
            apiKey: crypto.createHash('sha256').update("user"+new Date().getTime()).digest("hex"),
            userId: "user"
        };
        var exampleGame = {
            apiKey: crypto.createHash('sha256').update("game"+new Date().getTime()).digest("hex"),
            gameId: "game"
        };
        userStore.createOrUpdateUser(exampleUser, function(error, body) {
            winston.debug("Example user created.");
        });
        gameStore.createOrUpdateGame(exampleGame, function(error, body) {
            winston.debug("Example game created.");
        });
        authN.createAuthToken(exampleUser.userId, exampleGame.gameId, new Date().getTime(), "1234567890", function(token) {
            // check the generated token with the verify algorithm to make sure the system works nominal
            authN.verifyAuthToken(token, function(result, msg) {
                if (result) {
                    winston.debug("Running in debug mode. Use the following auth token for demo queries:");
                    winston.debug(token);
                }
                else
                    winston.debug("Token verification check failed: " + msg);
            })
        })
    }

    // setup server
    var app = express();
    app.use(express.bodyParser());
    app.set('name', 'Service');

    // enable cors
    app.use(cors);

    // setup component paths
    app.use('/oauth', require('./../oauth/Oauth'));

    // FIXME: find out why we can't use authN.verifyExpressRequest directly as argument.
    app.use('/store', function(req, res, next) {
        authN.verifyExpressRequest(req, res, next);
    }, require('./../store/Store'));

    // setup direct paths
    app.get('/event/:gameId/:userId/:eventId', function(req, res, next) {
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

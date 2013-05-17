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

var express = require('express');
var crypto = require('crypto');

var authService = require('../auth/authService.js');

var achievementRESTHandler = require('../server/requesthandler/AchievementRESTHandler');
var achievementInstanceRESTHandler = require('../server/requesthandler/AchievementInstanceRESTHandler');
var userStoreRESTHandler = require('../server/requesthandler/UserStoreRESTHandler');

var achievementInstanceIFrameHandler = require('../server/requesthandler/AchievementInstanceIFrameHandler');

var achievementFrontendRequestHandler = require('../server/requesthandler/AchievementFrontendRequestHandler');
var userStoreFrontendRequestHandler = require('../server/requesthandler/UserStoreFrontendRequestHandler');
var gameStoreFrontendRequestHandler = require('../server/requesthandler/GameStoreFrontendRequestHandler');

var frontendService = require('./FrontendService');
var iFrameService = require('./IFrameService');
var restService = require('./RESTService');

/**
 * Initializes and starts the service server for the various services.
 *
 * @param userStore
 * @param gameStore
 * @param achievementStore
 * @param achievementInstanceStore
 * @param achievementSystemInstance
 * @param achievementInstanceInitializer
 * @param logger
 */
function start(userStore, gameStore, achievementStore, achievementInstanceStore, achievementSystemInstance, achievementInstanceInitializer, logger) {

    // setup authN
    var authN = new authService.AuthService(userStore, gameStore);

    // setup server
    var app = express();
    app.enable("jsonp callback");
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.set('name', 'Service');
    app.set('views', __dirname + '/../views');

    // create example user and game if in debug mode
    if (QBadgeConfig.debugMode) {
        var exampleUser = {
            nonces: {"1234567890": (new Date().getTime())},
            apiKey: crypto.createHash('sha256').update("user"+new Date().getTime()).digest("hex"),
            userId: "developer",
            ownerId: "developer"
        };
        var exampleGame = {
            apiKey: crypto.createHash('sha256').update("game"+new Date().getTime()).digest("hex"),
            gameId: "mygame",
            ownerId: "developer"
        };
        Async.series([
            userStore.createOrUpdateUser(exampleUser, function(error, body) {
                logger.debug("Debug mode enabled: Example user created.");
            }),
            gameStore.createOrUpdateGame(exampleGame, function(error, body) {
                logger.debug("Debug mode enabled: Example game created.");
            })
            ],
            function(err, results){
                authN.createAuthToken(exampleUser.userId, exampleGame.gameId, new Date().getTime(), new Date().getTime(), function(token) {
                    // check the generated token with the verify algorithm to make sure the system works nominal
                    authN.verifyAuthToken(token, function(result, msg) {
                        if (result) {
                            logger.debug("Running in debug mode. Use the following auth token dispenser to get tokens for demo queries:");
                            logger.debug("http://localhost:" + QBadgeConfig.serverPort + "/token");
                        }
                        else
                            logger.debug("Token system verification check failed: " + msg);
                    })
                });
        });
        // create token dispenser route
        app.get('/token', function(req, res, next) {
            authN.createAuthToken(exampleUser.userId, exampleGame.gameId, new Date().getTime(), new Date().getTime(), function(token) {
                res.json(200, token);
            });
        });
    }

    // enable cors
    app.use(Utils.cors);

    // create handlers
    var achievementRESTHandlerInstance = achievementRESTHandler.achievementRESTHandler(achievementStore, logger);
    var achievementInstanceRESTHandlerInstance = achievementInstanceRESTHandler.achievementInstanceRESTHandler(achievementInstanceStore, achievementInstanceInitializer);
    var userStoreRESTHandlerInstance = userStoreRESTHandler.userStoreRESTHandler(userStore, logger);

    var achievementInstanceIFrameHandlerInstance = achievementInstanceIFrameHandler.achievementInstanceIFrameHandler(achievementInstanceStore, achievementInstanceInitializer, logger);

    var achievementFrontendRequestHandlerInstance = achievementFrontendRequestHandler.achievementFrontendRequestHandler(achievementStore, logger);
    var userStoreFrontendRequestHandlerInstance = userStoreFrontendRequestHandler.userStoreFrontendRequestHandler(userStore, logger);
    var gameStoreFrontendRequestHandlerInstance = gameStoreFrontendRequestHandler.gameStoreFrontendRequestHandler(gameStore, logger);

    // add services
    restService.restService(authN, app, achievementRESTHandlerInstance, achievementInstanceRESTHandlerInstance, userStoreRESTHandlerInstance, achievementSystemInstance, logger);
    iFrameService.iFrameService(authN, app, achievementInstanceIFrameHandlerInstance, logger);
    frontendService.frontendService(authN, app, achievementFrontendRequestHandlerInstance, userStoreFrontendRequestHandlerInstance, gameStoreFrontendRequestHandlerInstance, logger)

        // Run Server
    app.listen(QBadgeConfig.serverPort, function () {
        logger.info("QBadge Achievement System");
        logger.info("Copyright (c) 2013 Questor GmbH, Berlin");
        logger.info(app.get('name') + " listening at port " + QBadgeConfig.serverPort);
        if (!QBadgeConfig.authenticationEnabled) {
            logger.info("WARNING: AUTHENTICATION IS DISABLED. SEE DOCUMENTATION FOR DETAILS.")
        }
    });
}

exports.start = start;

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

function restService(authN, app, achievementRESTHandler, achievementInstanceRESTHandler, userStoreRESTHandler, storageStoreRESTHandler, achievementSystem, logger) {

    app.put('/store/model', function(req, res, next) {
        if (!QBadgeConfig.authenticationEnabled) {
            logger.debug("AuthN disabled. Not checking authentication.");
            next();
            return;
        }
        var doc = req.body;
        var decodedToken = authN.splitAuthToken(req.param("auth"));
        if (decodedToken==null || decodedToken.userId!=doc.ownerId || decodedToken.gameId!=doc.gameId) {
            logger.info("Request denied: token fields do not match request fields.");
            res.statusCode = 401;
            res.end('Unauthorized');
        } else
            authN.verifyExpressRequest(req, res, next);
    }, achievementRESTHandler.createAchievement);

    app.get('/store/model/:ownerId/:gameId', function(req, res, next) {
        if (!QBadgeConfig.authenticationEnabled) {
            logger.debug("AuthN disabled. Not checking authentication.");
            next();
            return;
        }
        var decodedToken = authN.splitAuthToken(req.param("auth"));
        if (decodedToken==null || decodedToken.userId!=req.params.ownerId || decodedToken.gameId!=req.params.gameId) {
            logger.info("Request denied: token fields do not match request fields.");
            res.statusCode = 401;
            res.end('Unauthorized');
        } else
            authN.verifyExpressRequest(req, res, next);
    }, achievementRESTHandler.getAchievementsByOwnerIdAndGameId);

    app.get('/store/model/:ownerId/:gameId/:userId', function(req, res, next) {
        if (!QBadgeConfig.authenticationEnabled) {
            logger.debug("AuthN disabled. Not checking authentication.");
            next();
            return;
        }
        var doc = req.body;
        var decodedToken = authN.splitAuthToken(req.param("auth"));
        if (decodedToken==null || decodedToken.userId!=req.params.ownerId || decodedToken.gameId!=req.params.gameId) {
            logger.info("Request denied: token fields do not match request fields.");
            res.statusCode = 401;
            res.end('Unauthorized');
        } else
            authN.verifyExpressRequest(req, res, next);
    }, achievementInstanceRESTHandler.initAchievementInstances);

    app.get('/store/instance/:gameId/:userId', function(req, res, next) {
        if (Utils.validParams(req, res, ["userId", "gameId"]))
            authN.verifyExpressRequest(req, res, next);
    }, achievementInstanceRESTHandler.getAchievementInstancesByGameIdAndUserId);

    app.get('/store/unlocked/:gameId/:userId', function(req, res, next) {
        if (Utils.validParams(req, res, ["userId", "gameId"]))
            authN.verifyExpressRequest(req, res, next);
    }, achievementInstanceRESTHandler.getUnlockedAchievementsByGameIdAndUserId);

    app.get('/store/user/:ownerId/:gameId/:userId', function(req, res, next) {
        if (!QBadgeConfig.authenticationEnabled) {
            logger.debug("AuthN disabled. Not checking authentication.");
            next();
            return;
        }
        var decodedToken = authN.splitAuthToken(req.param("auth"));
        if (decodedToken==null || decodedToken.userId!=req.params.ownerId || decodedToken.gameId!=req.params.gameId) {
            logger.info("Request denied: token fields do not match request fields.");
            res.statusCode = 401;
            res.end('Unauthorized');
        } else
            authN.verifyExpressRequest(req, res, next);
    }, userStoreRESTHandler.createUser);

    app.get('/event/:gameId/:userId/:eventId', function(req, res, next) {
        if (Utils.validParams(req, res, ["userId", "gameId"]))
            authN.verifyExpressRequest(req, res, next);
    }, function(req, res, next) {
        var event = {
            "tsInit": new Date().getTime(),
            "eventId": req.params.eventId,
            "gameId": req.params.gameId,
            "userId": req.params.userId
        };
        if (!event.tsInit) {
            event.tsInit =  Date.now() / 1000;
        }
        achievementSystem.triggerEvent(event, function (achievement) {});
        res.status(204);
        res.send();
    });

    // Storage Endpoints

    app.put('/storage/:gameId/:userId', function(req, res, next) {
        if (Utils.validParams(req, res, ["userId", "gameId"]))
            authN.verifyExpressRequest(req, res, function() {
                storageStoreRESTHandler.putStorage(req, res);
            });
    });

    app.get('/storage/:gameId/:userId/:storageId/:time', function(req, res, next) {
        if (Utils.validParams(req, res, ["userId", "gameId"]))
            authN.verifyExpressRequest(req, res, function() {
                storageStoreRESTHandler.getStorageByStorageId(req, res);
            });
    });

    app.get('/storage/:gameId/:userId/:storageId', function(req, res, next) {
        if (Utils.validParams(req, res, ["userId", "gameId"]))
            authN.verifyExpressRequest(req, res, function() {
                storageStoreRESTHandler.getStorageByStorageId(req, res);
            });
    });

    app.delete('/storage/:gameId/:userId/:storageId', function(req, res, next) {
        if (Utils.validParams(req, res, ["userId", "gameId"]))
            authN.verifyExpressRequest(req, res, function() {
                storageStoreRESTHandler.deleteStorageByStorageId(req, res);
            });
    });

    app.get('/storage/:gameId', function(req, res, next) {
        if (!QBadgeConfig.authenticationEnabled) {
            logger.debug("AuthN disabled. Not checking authentication.");
            next();
            return;
        }
        var decodedToken = authN.splitAuthToken(req.param("auth"));
        if (decodedToken==null || decodedToken.userId!=req.params.ownerId || decodedToken.gameId!=req.params.gameId) {
            logger.info("Request denied: token fields do not match request fields.");
            res.statusCode = 401;
            res.end('Unauthorized');
        } else
            authN.verifyExpressRequest(req, res, next);
    }, function(req, res, next) {
        storageStoreRESTHandler.listStorageByGameIdAndUserId(req, res);
    });

    app.get('/storage/:gameId/:userId', function(req, res, next) {
        if (!QBadgeConfig.authenticationEnabled) {
            logger.debug("AuthN disabled. Not checking authentication.");
            next();
            return;
        }
        var decodedToken = authN.splitAuthToken(req.param("auth"));
        if (decodedToken==null || decodedToken.userId!=req.params.ownerId || decodedToken.gameId!=req.params.gameId) {
            logger.info("Request denied: token fields do not match request fields.");
            res.statusCode = 401;
            res.end('Unauthorized');
        } else
            authN.verifyExpressRequest(req, res, next);
    }, function(req, res, next) {
        storageStoreRESTHandler.listStorageByGameIdAndUserId(req, res);
    });
}

exports.restService = restService;

/*
 * Playfinity
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

frontendService = function(authN, app, achievementFrontendRequestHandler, userStoreFrontendRequestHandler, gameStoreFrontendRequestHandler, logger) {

    app.post('/frontend/model/create', function(req, res, next) {
        if (!PlayfinityConfig.authenticationEnabled) {
            logger.debug("AuthN disabled. Not checking authentication.");
            next();
            return;
        }
        var doc = req.body;
        if (typeof req.cookies.ownerId=="undefined" || req.cookies.ownerId!=doc.ownerId || req.cookies.ownerId!=doc.ownerId) {
            logger.info("Request denied: token fields do not match request fields.");
            res.statusCode = 401;
            res.end('Unauthorized');
        }
    }, achievementFrontendRequestHandler.createFrontendAchievement);

    app.post('/frontend/model/rules/process', function(req, res, next) {
        if (!PlayfinityConfig.authenticationEnabled) {
            logger.debug("AuthN disabled. Not checking authentication.");
            next();
            return;
        }
        if (typeof req.cookies.ownerId=="undefined" || req.cookies.ownerId==null || req.cookies.ownerId!=req.params.ownerId) {
            logger.info("Request denied: token fields do not match request fields.");
            res.statusCode = 401;
            res.end('Unauthorized');
        }
    }, achievementFrontendRequestHandler.getFrontendAchievementRulesJSONByOwnerIdAndId);

    app.post('/frontend/model/rules', function(req, res, next) {
        if (!PlayfinityConfig.authenticationEnabled) {
            logger.debug("AuthN disabled. Not checking authentication.");
            next();
            return;
        }
        if (typeof req.cookies.ownerId=="undefined" || req.cookies.ownerId==null || req.cookies.ownerId!=req.params.ownerId) {
            logger.info("Request denied: token fields do not match request fields.");
            res.statusCode = 401;
            res.end('Unauthorized');
        }
    }, achievementFrontendRequestHandler.getFrontendAchievementRulesByOwnerIdAndId);

    app.post('/frontend/model', function(req, res, next) {
        if (!PlayfinityConfig.authenticationEnabled) {
            logger.debug("AuthN disabled. Not checking authentication.");
            next();
            return;
        }
        if (typeof req.cookies.ownerId=="undefined" || req.cookies.ownerId==null || req.cookies.ownerId!=req.params.ownerId) {
            logger.info("Request denied: token fields do not match request fields.");
            res.statusCode = 401;
            res.end('Unauthorized');
        }
    }, achievementFrontendRequestHandler.getFrontendAchievementsByOwnerId);

    app.post('/frontend/game/create', function(req, res, next) {
        if (!PlayfinityConfig.authenticationEnabled) {
            logger.debug("AuthN disabled. Not checking authentication.");
            next();
            return;
        }
        if (typeof req.cookies.ownerId=="undefined" || req.cookies.ownerId==null || req.cookies.ownerId!=req.params.ownerId) {
            logger.info("Request denied: token fields do not match request fields.");
            res.statusCode = 401;
            res.end('Unauthorized');
        }
    }, gameStoreFrontendRequestHandler.createFrontendGame);

    app.post('/frontend/game/idoptions', function(req, res, next) {
        if (!PlayfinityConfig.authenticationEnabled) {
            logger.debug("AuthN disabled. Not checking authentication.");
            next();
            return;
        }
        if (typeof req.cookies.ownerId=="undefined" || req.cookies.ownerId==null || req.cookies.ownerId!=req.params.ownerId) {
            logger.info("Request denied: token fields do not match request fields.");
            res.statusCode = 401;
            res.end('Unauthorized');
        }
    }, gameStoreFrontendRequestHandler.getFrontendGameIdsByOwnerId);

    app.post('/frontend/game', function(req, res, next) {
        if (!PlayfinityConfig.authenticationEnabled) {
            logger.debug("AuthN disabled. Not checking authentication.");
            next();
            return;
        }
        if (typeof req.cookies.ownerId=="undefined" || req.cookies.ownerId==null || req.cookies.ownerId!=req.params.ownerId) {
            logger.info("Request denied: token fields do not match request fields.");
            res.statusCode = 401;
            res.end('Unauthorized');
        }
    }, gameStoreFrontendRequestHandler.getFrontendGamesByOwnerId);

    app.post('/frontend/user/create', function(req, res, next) {
        if (!PlayfinityConfig.authenticationEnabled) {
            logger.debug("AuthN disabled. Not checking authentication.");
            next();
            return;
        }
        var doc = req.body;
        if (typeof req.cookies.ownerId=="undefined" || req.cookies.ownerId==null || req.cookies.ownerId!=req.params.ownerId || req.cookies.ownerId!=doc.ownerId) {
            logger.info("Request denied: token fields do not match request fields.");
            res.statusCode = 401;
            res.end('Unauthorized');
        } else
            authN.verifyExpressRequest(req, res, next);
    }, userStoreFrontendRequestHandler.createFrontendUser);

    app.post('/frontend/user', function(req, res, next) {
        if (!PlayfinityConfig.authenticationEnabled) {
            logger.debug("AuthN disabled. Not checking authentication.");
            next();
            return;
        }
        if (typeof req.cookies.ownerId=="undefined" || req.cookies.ownerId==null || req.cookies.ownerId!=req.params.ownerId) {
            logger.info("Request denied: token fields do not match request fields.");
            res.statusCode = 401;
            res.end('Unauthorized');
        }
    }, userStoreFrontendRequestHandler.getFrontendUserByOwnerId);

    app.get('/login', function(req, res, next) {
        if (typeof req.param("username")=="undefined" || typeof req.param("password")=="undefined")
            res.redirect("/index.html");
        var hashedPass = crypto.createHash('sha256').update(req.param("password")).digest("hex");
        userStoreFrontendRequestHandler.getUser(req.param("username"), function(error, result) {
            /*
            if (result.length!=1 || result[0].value.password!=hashedPass)
                res.redirect("/index.html");
            else {
                res.cookie("ownerId", result[0].value.userId);
                res.redirect("/console.html?user=" + result[0].value.userId);
            }
            */
            res.cookie("ownerId", result[0].value.userId);
            res.redirect("/console.html?user=" + result[0].value.userId);
        })
    });

    // Setup static html route
    if (PlayfinityConfig.frontendEnabled)
        app.use("/", express.static(__dirname + '/../frontend'));
}

exports.frontendService = frontendService;

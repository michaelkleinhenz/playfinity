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
 * Functions for operations on user data.
 */

var crypto = require('crypto');

userStore = function(conf) {
    var db = conf.db;
    var logger = conf.logger;
    var self = {};

    self.getUser = function (userId, callback) {
        db.view('user', 'byUserId', {"key": userId}, function(error, body) {
            if (error) {
                logger.error("Not able to get user: userId=" + userId +
                    ", error=" + JSON.stringify(error));
            }
            callback(error, (typeof body=="undefined")?body:body.rows);
        });
    };

    self.getUsers = function (ownerId, callback) {
        db.view('user', 'byOwnerId', {"key": ownerId}, function(error, body) {
            if (error) {
                logger.error("Not able to get users: ownerId=" + ownerId +
                    ", error=" + JSON.stringify(error));
            }
            callback(error, (typeof body=="undefined")?body:body.rows);
        });
    };

    self.deleteUser = function (user, callback) {
        db.destroy(user.id, user.revision, function(error, body) {
            if (error) {
                logger.error("Not able to delete user: userId=" + user.id +
                    ", revision=" + user.revision +
                    ", error" + JSON.stringify(error));
            }
            callback(error);
        });
    };

    self.createOrUpdateUser = function (user, callback) {
        user._id = user.userId;
        db.insert(user, function (error, body, headers) {
            if (error) {
                logger.error("Not able to insert user" +
                    JSON.stringify(user) + " Reason:" + error);
            }
            callback(error);
        });
    };

    self.createUser = function (req, res, next) {
        var user = {
            nonces: {},
            apiKey: crypto.createHash('sha256').update(Utils.uuid()).digest("hex"),
            userId: req.param("userId"),
            ownerId: req.param("ownerId"),
            gameId: req.param("gameId")
        };
        logger.info('createUser(' + JSON.stringify(user) + ')' );
        self.createOrUpdateUser(user, function(error) {
            if (error) {
                res.json("Error creating user.");
                res.send(500);
            } else {
                delete user.nonces;
                delete user._id;
                res.json(user);
            }
        })
    }

    self.getFrontendUserByOwnerId = function(req, res, next) {
        if (typeof req.param("ownerId")=="undefined" || req.param("ownerId")==null)
            res.json({
                "Result":"ERROR",
                "Message": "OwnerId must not be null.",
                "TotalRecordCount":0,
                "Records":[]})
        else
            self.getUsers(req.param("ownerId"), function(error, result) {
                var output = [];
                res.json(Utils.toJTableResult(req.param("jtStartIndex"), req.param("jtPageSize"), req.param("jtSorting"), result));
            });
    }

    self.createFrontendUser = function(req, res, next) {
        if (typeof req.param("ownerId")=="undefined" || req.param("ownerId")==null || req.param("ownerId")!=req.body.ownerId)
            res.json({
                "Result":"ERROR",
                "Message": "OwnerId must not be null.",
                "TotalRecordCount":0,
                "Records":[]});
        else {
            var doc = {
                "userId": req.body.userId,
                "gameId": req.body.gameId,
                "ownerId": req.body.ownerId,
                "apiKey": crypto.createHash('sha256').update(Utils.uuid()).digest("hex")
            };
            self.getUser(doc.userId, function(error, result) {
                if (error) {
                    res.json({
                        "Result":"ERROR",
                        "Message": error
                    });
                    res.send(404);
                    logger.error("Not able to insert " + doc + " Reason:" + error);
                } else
                if (result.length!=0) {
                    res.json({
                        "Result":"ERROR",
                        "Message": "The given userId is already taken."
                    });
                    res.send(404);
                    logger.error("Not able to insert " + doc + " Reason: The given userId is already taken.");
                } else {
                    self.createOrUpdateUser(doc, function(error, result) {
                        if (error) {
                            res.json({
                                "Result":"ERROR",
                                "Message": error
                            });
                            res.send(404);
                            logger.error("Not able to insert " + doc + " Reason:" + error);
                        } else
                            res.json({
                                "Result":"OK",
                                "Record": doc
                            });
                    });
                }
            });
        }
    }

    return self;
}

exports.userStore = userStore;
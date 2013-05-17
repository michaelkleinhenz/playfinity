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

var crypto = require('crypto');

/**
 * Request Handler for handling web access to user data. Needs configuration with
 * "userStore" and "logger".
 *
 * @param userStore
 * @param logger
 * @returns {{}}
 */
userStoreFrontendRequestHandler = function(userStore, logger) {
    var self = {};

    self.getFrontendUserByOwnerId = function(req, res, next) {
        if (typeof req.param("ownerId")=="undefined" || req.param("ownerId")==null)
            res.json({
                "Result":"ERROR",
                "Message": "OwnerId must not be null.",
                "TotalRecordCount":0,
                "Records":[]})
        else
            userStore.getUsers(req.param("ownerId"), function(error, result) {
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
            userStore.getUser(doc.userId, function(error, result) {
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
                    userStore.createOrUpdateUser(doc, function(error, result) {
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

exports.userStoreFrontendRequestHandler = userStoreFrontendRequestHandler;
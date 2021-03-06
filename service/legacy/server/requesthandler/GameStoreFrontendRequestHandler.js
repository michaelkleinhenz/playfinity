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

var crypto = require('crypto');

/**
 * Web Request handlers for accessing game data. Needs configuration with
 * "gameStore" and "logger".
 *
 * @param gameStore
 * @param logger
 * @returns {{}}
 */
gameStoreFrontendRequestHandler = function(gameStore, logger) {
    var self = {};

    self.getFrontendGamesByOwnerId = function(req, res, next) {
        if (typeof req.param("ownerId")=="undefined" || req.param("ownerId")==null)
            res.json({
                "Result":"ERROR",
                "Message": "OwnerId must not be null.",
                "TotalRecordCount":0,
                "Records":[]})
        else
            gameStore.getGames(req.param("ownerId"), function(error, result) {
                var output = [];
                res.json(Utils.toJTableResult(req.param("jtStartIndex"), req.param("jtPageSize"), req.param("jtSorting"), result));
            });
    }

    self.getFrontendGameIdsByOwnerId = function(req, res, next) {
        if (typeof req.param("ownerId")=="undefined" || req.param("ownerId")==null)
            res.json({
                "Result":"ERROR",
                "Message": "OwnerId must not be null.",
                "TotalRecordCount":0,
                "Records":[]})
        else
            gameStore.getGames(req.param("ownerId"), function(error, result) {
                var out = {
                    "Result":"OK",
                    "Options": []
                };
                for (var i=0; i<result.length; i++) {
                    out.Options.push({
                        "DisplayText":result[i].value.gameId,
                        "Value":result[i].value.gameId
                    });
                };
                res.json(out);
            });
    }

    self.createFrontendGame = function(req, res, next) {
        if (typeof req.param("ownerId")=="undefined" || req.param("ownerId")==null || req.param("ownerId")!=req.body.ownerId)
            res.json({
                "Result":"ERROR",
                "Message": "OwnerId must not be null.",
                "TotalRecordCount":0,
                "Records":[]});
        else {
            var doc = {
                "_id": req.body.gameId,
                "gameId": req.body.gameId,
                "ownerId": req.body.ownerId,
                "apiKey": crypto.createHash('sha256').update(Utils.uuid()).digest("hex")
            };
            gameStore.getGame(doc.gameId, function(error, result) {
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
                            "Message": "The given gameId is already taken."
                        });
                        res.send(404);
                        logger.error("Not able to insert " + doc + " Reason: The given gameId is already taken.");
                    } else {
                        gameStore.createOrUpdateGame(doc, function(error, result) {
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

exports.gameStoreFrontendRequestHandler = gameStoreFrontendRequestHandler;
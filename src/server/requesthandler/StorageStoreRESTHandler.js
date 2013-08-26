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
 * Handler for operations on the storage store. Need configuration with "storageStore" and "logger".
 *
 * @param authN
 * @param storageStore
 * @param logger
 * @returns {{}}
 */
storageStoreRESTHandler = function(authN, storageStore, logger) {
    var self = {};

    self.listStorageByGameIdAndUserId = function(req, res) {
        var gameId = req.params.gameId;
        var userId = req.params.userId;
        if (typeof userId=="undefined")
            storageStore.listStorageByGameId(gameId, callback);
        else
            storageStore.listStorageByGameIdAndUserId(gameId, userId, callback);

        function callback(error, result) {
            if (error) {
                res.json(500, JSON.stringify(error));
                return;
            }
            var out = [];
            for (var i=0; i<result.length; i++) {
                if ((result[i].value.userId==userId && result[i].value.gameId==gameId) || (result[i].value.gameId==gameId && typeof userId=="undefined")) {
                    delete result[i].value._id;
                    delete result[i].value._rev;
                    out.push(result[i].value);
                }
            }
            res.json(out);
        }
    }

    self.getStorageByStorageId = function(req, res) {
        var userId = req.params.userId;
        var gameId = req.params.gameId;
        var storageId = req.params.storageId;
        var time = req.params.time;
        storageStore.getStorage(storageId, callback);

        function callback(error, result) {
            if (error || result.length!=1 || result[0].value.userId!=userId || result[0].value.gameId!=gameId) {
                res.send(500);
            } else {
                if (typeof time=="undefined" || time==null || result[0].value.timestamp>time)
                    // time was not specified or data is newer than time
                    res.send(result[0].value.data);
                else
                    // no new data
                    res.send(404);
            }
        }
    }

    self.deleteStorageByStorageId = function(req, res) {
        var userId = req.params.userId;
        var gameId = req.params.gameId;
        var storageId = req.params.storageId;
        storageStore.getStorage(storageId, callback);

        function callback(error, result) {
            if (error || result.length!=1 || result[0].value.userId!=userId || result[0].value.gameId!=gameId) {
                res.send(500);
            } else {
                console.log(result[0].value);
                storageStore.deleteStorage(result[0].value, function(error) {
                    if (error)
                        res.send(500);
                    else
                        res.send(200);
                });
            }
        }
    }

    self.putStorage = function(req, res) {
        var data = req.body;
        Async.series({
            game: function(callback){
                authN.retrieveGame(req.params.gameId, function(result) {
                    callback(null, result);
                });
            },
            user: function(callback){
                authN.retrieveUser(req.params.userId, function(result) {
                    callback(null, result);
                });
            }
        },
        function(err, results){
            if (typeof results.game=="undefined" || typeof results.user=="undefined") {
                res.send(500);
                return;
            }
            if (results.game.ownerId!=results.user.ownerId) {
                res.json(500, "User and game have different owners.");
                return;
            }
            if (results.game.gameId!=results.user.gameId) {
                res.json(500, "User and game are not attached.");
                return;
            }
            var uuid = Utils.hash(Utils.uuid());
            var storage = {
                storageId: uuid,
                ownerId: results.game.ownerId,
                gameId: req.params.gameId,
                userId: req.params.userId,
                timestamp: new Date().getTime(),
                data: data
            };
            storageStore.createOrUpdateStorage(storage, callback);
            function callback(error, result) {
                if (error) {
                    res.json(500, error);
                } else
                    delete storage.data;
                    res.json(200, storage);
                }
            });
    }

    return self;
}

exports.storageStoreRESTHandler = storageStoreRESTHandler;
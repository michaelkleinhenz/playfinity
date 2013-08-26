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
 * Operations for access to database storage data. 
 *
 * @param db
 * @param logger
 * @returns {{}}
 */
storageStore = function(db, logger) {
    var self = {};
    
    self.getStorage = function (storageId, callback) {

        db.view('storage', 'byId', {"key": storageId}, function(error, body) {
            if (error) {
                logger.error("Not able to get storage: storageId=" + storageId +
                    ", error=" + JSON.stringify(error));
            }
            callback(error, (typeof body=="undefined")?body:body.rows);
        });
    };

    self.getStorages = function (ownerId, callback) {
        db.view('storage', 'byOwnerId', {"key": ownerId}, function(error, body) {
            if (error) {
                logger.error("Not able to get storage: storageId=" + storageId +
                    ", error=" + JSON.stringify(error));
            }
            callback(error, (typeof body=="undefined")?body:body.rows);
        });
    };

    self.listStorageByGameId = function (gameId, callback) {
        db.view('storage', 'byGameId', {"key": gameId}, function(error, body) {
            if (error) {
                logger.error("Not able to get storage: storageId=" + storageId +
                    ", error=" + JSON.stringify(error));
            }
            callback(error, (typeof body=="undefined")?body:body.rows);
        });
    };

    self.listStorageByGameIdAndUserId = function (gameId, userId, callback) {
        db.view('storage', 'byGameIdAndUserId', {"key": [gameId, userId]}, function(error, body) {
            if (error) {
                logger.error("Not able to get storage: storageId=" + storageId +
                    ", error=" + JSON.stringify(error));
            }
            callback(error, (typeof body=="undefined")?body:body.rows);
        });
    };

    self.deleteStorage = function (storage, callback) {
        db.destroy(storage._id, storage._rev, function(error, body) {
            if (error) {
                logger.error("Not able to delete storage: storageId=" + storage.id +
                    ", revision=" + storage.revision +
                    ", error" + JSON.stringify(error));
            }
            callback(error);
        });
    };

    self.createOrUpdateStorage = function (storage, callback) {
        storage._id = storage.storageId;
        db.insert(storage, function (error, body, headers) {
            if (error) {
                logger.error("Not able to insert storage" +
                    JSON.stringify(storage) + " Reason:" + error);
            }
            callback(error);
        });
    };

    return self;
}

exports.storageStore = storageStore;
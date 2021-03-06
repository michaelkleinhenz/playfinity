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
 * Operations on database user data. Needs configuration with
 * "db" and "logger".
 *
 * @param db
 * @param logger
 * @returns {{}}
 */
userStore = function(db, logger) {
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

    return self;
}

exports.userStore = userStore;
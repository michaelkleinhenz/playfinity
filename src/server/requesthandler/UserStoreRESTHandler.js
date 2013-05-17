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
 * Handler for operations on the user store. Need configuration with "userStore" and "logger".
 *
 * @param userStore
 * @param logger
 * @returns {{}}
 */
userStoreRESTHandler = function(userStore, logger) {
    var self = {};

    self.createUser = function (req, res, next) {
        var user = {
            nonces: {},
            apiKey: crypto.createHash('sha256').update(Utils.uuid()).digest("hex"),
            userId: req.param("userId"),
            ownerId: req.param("ownerId"),
            gameId: req.param("gameId")
        };
        logger.info('createUser(' + JSON.stringify(user) + ')' );
        userStore.createOrUpdateUser(user, function(error) {
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

    return self;
}

exports.userStoreRESTHandler = userStoreRESTHandler;
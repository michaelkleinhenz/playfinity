/*
 * QAuth
 * Questor Authentication System
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
var winston = require('winston');
var crypto = require('crypto');

/**
 * Creates a new instance of the AuthService.
 *
 * @param userStore reference to the user store.
 * @constructor
 */
function AuthService(userStore) {
    this.nonceReleaseTimeMs = 1000*60*60*24; // 24 hours
    this.userStore = userStore;
}

/**
 * Checks if the given date is too old to be deemed valid.
 *
 * @param date the date to be checked.
 * @returns {boolean} true if the date is too old, false otherwise.
 */
AuthService.prototype.isDateToOld = function(date) {
    var now = new Date().getTime();
    var diff = now - date;
    if(diff > this.nonceReleaseTimeMs) {
        return true;
    }
    return false;
}

/**
 * Calculates the hash of a given string.
 *
 * @param input string to be hashed.
 * @returns {*} hash value.
 */
AuthService.prototype.calculateHash = function(input) {
    if (input === undefined) {
        return undefined;
    } else
        return crypto.createHash('sha256').update(input).digest("hex");
}

/**
 * Retrieves the API key by user id.
 *
 * @param userId user id of the key to be retrieved.
 * @param callback
 */
AuthService.prototype.getApiKey = function(userId, callback) {
    this.userStore.getUser(userId, function(error, rows) {
        if (error) {
            winston.error("Not able to get user from user store: userId=" + userId +
                ", error=" + JSON().stringify(error));
        }
        callback(error, rows[0].value.apiKey);
    });
}

/**
 * Retrieves the list of current nonces by user id. Returns objects with
 * nonce value as key, date issued as value.
 *
 * @param userId
 * @param callback
 */
AuthService.prototype.getNonces = function(userId, callback) {
    this.userStore.getUser(userId, function(error, rows) {
        if (error) {
            winston.error("Not able to get user from user store: userId=" + userId +
                ", error=" + JSON().stringify(error));
        }
        callback(error, rows[0].value.nonces);
    });
}

/**
 * Stores a nonce with user id and date.
 *
 * @param userId user id to be stored.
 * @param nonce the nonce to be stored.
 * @param date the issue date of the nonce.
 * @param callback
 */
AuthService.prototype.storeNonce = function(userId, nonce, date, callback) {
    var self = this;
    this.userStore.getUser(userId, function(error, rows) {
        if (error) {
            winston.error("Not able to get user from user store: userId=" + userId +
                ", error=" + JSON().stringify(error));
        } else {
            rows[0].value.nonces[nonce] = date;
            self.userStore.createOrUpdateUser(rows[0], function(error) {
                if (error) {
                    winston.error("Not able to update nonce on user: userId=" + userId +
                        ", error=" + JSON().stringify(error));
                }
            });
        }
        callback();
    });
}

/**
 * Removes a nonce from storage.
 *
 * @param userId the user id of the nonce.
 * @param nonce the nonce to be deleted.
 * @param callback
 */
AuthService.prototype.deleteNonce = function(userId, nonce, callback) {
    var self = this;
    this.userStore.getUser(userId, function(error, rows) {
        if (error) {
            winston.error("Not able to get user from user store: userId=" + userId +
                ", error=" + JSON().stringify(error));
        } else {
            delete rows[0].value.nonces[nonce];
            self.userStore.createOrUpdateUser(rows[0], function(error) {
                if (error) {
                    winston.error("Not able to update nonce on user: userId=" + userId +
                        ", error=" + JSON().stringify(error));
                }
            });
        }
        callback();
    });
}

/**
 * Checks if the given nonce is valid for the given userId. Checks
 * first if the nonce has already been used in the ttl of nonces.
 *
 * @param userId
 * @param nonce
 * @param callback
 */
AuthService.prototype.isNonceValid = function(userId, nonce, callback) {
    var self = this;
    this.getNonces(userId, function(nonces) {
        var currentDate = new Date().getTime();
        if (typeof nonces == "undefined" || nonces==null || typeof nonces[nonce] == "undefined") {
            self.storeNonce(userId, nonce, currentDate, function() {
                callback(true);
            });
        } else {
            if (((currentDate-nonces[nonce])<this.nonceReleaseTimeMs))
                callback(false, "Err: nonce already known.");
            else {
                self.deleteNonce(userId, nonce, function() {});
                self.storeNonce(userId, nonce, currentDate, function() {
                    callback(true);
                });
            }
        };
    });
}

/**
 * Verifies the key/hash. The algorithm takes a SHA-256 hash of the following
 * concatenated string: "apiKey + userId + epoch + nonce".
 *
 * @param hash the calculated hash.
 * @param userId the user id.
 * @param epoch the ms since epoch.
 * @param nonce the nonce.
 * @param callback the callback called with the result.
 */
AuthService.prototype.apiKeyAndHashValidation = function(hash, userId, epoch, nonce, callback) {
    var self = this;
    this.getApiKey(userId, function(apiKey) {
        if(apiKey === undefined) {
            callback(false, "Err: Could not find api key.");
            return;
        }
        var calculatedHash = self.calculateHash(apiKey + userId + epoch + nonce);
        if(!(calculatedHash === hash)) {
            callback(false, "Err: hash mismatch, expected " + calculatedHash + " received " + hash);
        } else
            callback(true, "Success");
    });
}

/**
 * Creates an auth token from the given data.
 *
 * @param userId the user id.
 * @param epoch the current epoch.
 * @param nonce the nonce.
 * @param callback
 */
AuthService.prototype.createAuthToken = function(userId, epoch, nonce, callback) {
    var self = this;
    this.getApiKey(userId, function(apiKey) {
        var calculatedHash = self.calculateHash(apiKey + userId + epoch + nonce);
        callback(calculatedHash + "%" +userId + "%" + epoch + "%" + nonce);
    })
}

/**
 * Verifies the plain auth data. Calls callback with results.
 *
 * @param hash the auth hash in the form "apiKey + userId + epoch + nonce".
 * @param userId the user id.
 * @param epoch the epoch.
 * @param nonce the nonce.
 * @param callback
 */
AuthService.prototype.verifyAuthData = function(hash, userId, epoch, nonce, callback) {
    var self = this;
    // check if given date is too old
    if(this.isDateToOld(epoch)) {
        callback(false, "Err: date timeout.");
        return;
    }
    // check if nonce is valid, check keyhash
    this.isNonceValid(userId, nonce, function(result) {
        if (result)
            self.apiKeyAndHashValidation(hash, userId, epoch, nonce, callback);
        else
            callback(false, "Err: nonce already known.")
    });
};

/**
 * Verifies the given token in the form "hash%userId%epoch%nonce".
 *
 * @param token the token to be verified.
 * @param callback
 */
AuthService.prototype.verifyAuthToken = function(token, callback) {
    if (typeof token == "undefined")
        callback(false, "Err: token empty.");
    else {
        var dataArray = token.split("%");
        if (dataArray.length!=4)
            callback(false, "Err: token format unknown.");
        else
            this.verifyAuthData(dataArray[0], dataArray[1], dataArray[2], dataArray[3], callback);
    }
}

/**
 * Validates an express request. Expects the complete hash and metadata in a request
 * parameter named "auth" with the following format: "hash%userId%epoch%nonce".
 *
 * @param req Express request.
 * @param res Express response.
 * @param next
 */
AuthService.prototype.verifyExpressRequest = function(req, res, next) {
    var self = this;
    this.verifyAuthToken(req.param("auth"), function(verified, msg) {
        if (verified) {
            winston.info("Request authenticated.")
            next();
        } else {
            winston.info("Request denied: " + msg)
            res.statusCode = 401;
            res.end('Unauthorized');
        }
    });
};

// node integration, if running in node
if (typeof exports != "undefined") {
    exports.AuthService = AuthService;
}

/*

// user user
// key set97Wruset97Wruset97Wruset97Wru
// nonce 123
createAuthToken("user", new Date().getTime(), "1230", function(token) {
    console.log("Created token: " + token);
    verifyAuthToken(token, function(result, message) {
        console.log("Verify result: " + result + " " + message);
    })
})
    */
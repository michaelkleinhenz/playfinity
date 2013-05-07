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

var authVerifier = require("authVerifier");

var config = {
    nonceReleaseTimeMs: 60000
}

function processRequest(req, res) {
    var callbackForVerifyIfRequestIsAuthorized = function (verified, msg) {
        if (verified) {
            winston.info("Request authenticated.")
        } else {
            winston.info("Request denied: " + msg)
        }
    }

    verifyIfRequestIsAuthorized(req.params.userId, req.params.date, req.params.nonce, req.params.opData, req.params.hash, callbackForVerifyIfRequestIsAuthorized);
};

function verifyIfRequestIsAuthorized(system, userId, dateAsString, nolp, opData, hash, verificationCallback) {

    /**
     * Verifies if the given string matches the date pattern.
     *
     * @param dateString date string to be checked.
     * @returns {boolean} true if pattern matches, false otherwise.
     */
    var validateDatePattern = function(dateString) {
        var validationPattern = /^\d{4}-\d{1,2}-\d{1,2}_\d{1,2}:\d{1,2}:\d{1,2}$/;
        if(validationPattern.test(dateString)) {
            return true;
        }
        return false;
    }

    /**
     * Parses a string, returns parsed date.
     *
     * @param dateString string to be parsed.
     * @returns {Date} parsed date.
     */
    var parseStringToDate = function(dateString) {
        var splitedDate = dateString.split("_");
        var yearMonthDay = splitedDate[0].split("-");
        var hourMinuteSecond = splitedDate[1].split(":");
        var parsedDate = new Date(yearMonthDay[0], yearMonthDay[1]-1, yearMonthDay[2], hourMinuteSecond[0], hourMinuteSecond[1], hourMinuteSecond[2]);
        return parsedDate;
    }

    /**
     * Checks if the given date is too old to be deemed valid.
     *
     * @param date the date to be checked.
     * @returns {boolean} true if the date is too old, false otherwise.
     */
    var isDateToOld = function(date) {
        var now = new Date();
        //diff is in milli-seconds (1000ms = 1s)
        var dif = now - date;
        dif = dif / 1000;
        if(dif > config.nonceReleaseTimeMs) {
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
    var calculateHash = function(input) {
        if (input === undefined) {
            return undefined;
        } else
            return crypto.createHash('sha256').update(stringToHash).digest("hex");
    }

    /**
     * Retrieves the API key by user id.
     *
     * @param userId user id of the key to be retrieved.
     * @returns {string} API key.
     */
    var getApiKeyById = function(userId) {
        //This is only for testing.
        //Later you must implement a real connection to a db to get api key
        if(userId === "12345") {
            return "set97Wruset97Wruset97Wruset97Wru";
        }
    }

    /**
     * Retrieves the list of current nonces by user id. Returns objects with
     * nonce value as key, date issued as value.
     *
     * @param userId
     * @returns {*} nonce object list.
     */
    var getNonces = function(userId) {
        // TODO READ NONCE
    }

    /**
     * Stores a nonce with user id and date.
     *
     * @param userId user id to be stored.
     * @param nonce the nonce to be stored.
     * @param date the issue date of the nonce.
     */
    var storeNonce = function(userId, nonce, date) {
        // TODO WRITE NONCE
    }

    /**
     * Removes a nonce from storage.
     *
     * @param userId the user id of the nonce.
     * @param nonce the nonce to be deleted.
     */
    var deleteNonce = function(userId, nonce) {
        // TODO DELETE NONCE
    }

    /**
     * Checks if the given nonce is valid for the given userId. Checks
     * first if the nonce has already been used in the ttl of nonces.
     *
     * @param userId
     * @param nonce
     * @param callback
     */
    var isNonceValid = function(userId, nonce, callback) {
        var nonces = getNonces(userId);
        var currentDate = new Date().getTime();
        for (var dbNonce in nonces) {
            if (dbNonce===nonce)
                if (((currentDate-nonces[nonce])<config.nonceReleaseTimeMs))
                    callback(false);
                else
                    deleteNonce(userId, nonce);
            else {
                storeNonce(userId, nonce, currentDate);
                callback(true);
            }
        }
    }

    /**
     * Verifies the key/hash. The algorithm takes a SHA-256 hash of the following
     * concatenated string: "apiKey + userId + dateAsString + nolp".
     */
    var apiKeyAndHashValidation = function(verified) {
        if (!verified) {
            verificationCallback(false, "Err: Nolp already in db.");
            return;
        }
        var apiKey = getApiKeyById(userId);
        if(apiKey === undefined) {
            verificationCallback(false, "Err: Could not find api key.");
            return;
        }

        var calculatedHash = calculateHash(apiKey + userId + dateAsString + nonce);
        if(!(calculatedHash === hash)) {
            verificationCallback(false, "Err: Hashes did not match. Calculated: " + calculatedHash + " Received: " + hash);
            return;
        }
        verificationCallback(true, "Verification completed successfully.");
    }

    // check date pattern and parse date
    if(!validateDatePattern(dateAsString)) {
        verificationCallback(false, "Err: Date pattern not valid.");
        return;
    };
    var parsedDate = parseStringToDate(dateAsString);

    // check if given date is too old
    if(isDateToOld(parsedDate)) {
        verificationCallback(false, "Err: Out of date.");
        return;
    }

    // check if nonce is valid, check keyhash
    isNonceValid(userId, nonce, dateAsString, apiKeyAndHashValidation);
};


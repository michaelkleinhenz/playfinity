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

var Utils = {

    arrayContains : function(array, obj) {
        var i = array.length;
        while (i--) {
            if (array[i] === obj) {
                return true;
            }
        }
        return false;
    },

    toJTableResult : function(startIndex, pageSize, sorting, dbResultRows) {
        if (typeof startIndex=="undefined")
            startIndex = 0;
        if (typeof pageSize=="undefined")
            pageSize = dbResultRows.length;
        var sortField = null;
        var sortOrder = null;
        var sortingArray = null;
        if (typeof sorting!="undefined") {
            sortingArray = sorting.split(" ");
            if (sorting.split(" ").length==2) {
                sortField = sorting.split(" ")[0];
                sortOrder =  sorting.split(" ")[1];
            } else
                return null;
        }
        var reqResult = {
            "Result":"OK",
            "TotalRecordCount":dbResultRows.length,
            "Records":[]
        };
        if (Array.isArray(dbResultRows)) {
            for (var i=startIndex; i<startIndex+pageSize; i++)
                if (typeof dbResultRows[i]!="undefined")
                    if (typeof dbResultRows[i].value=="undefined")
                        reqResult.Records.push(dbResultRows[i]);
                    else
                        reqResult.Records.push(dbResultRows[i].value);
        } else
            reqResult.Records.push(dbResultRows);
        return reqResult;
    },

    arrayNormalize: function(result, inputArray) {
        for (var i=0; i<inputArray.length; i++)
            if (Array.isArray(inputArray[i]))
                Utils.arrayNormalize(result, inputArray[i]);
            else {
                result.push(inputArray[i]);
            }
        return result;
    },

    hash: function(data) {
        return crypto.createHash('sha256').update("game"+new Date().getTime()).digest("hex");
    },

    uuid: function() {
        var nbr, randStr = "";
        do {
            randStr += (nbr = Math.random()).toString(16).substr(2);
        } while (randStr.length < 30);
        return [
            randStr.substr(0, 8), "-",
            randStr.substr(8, 4), "-4",
            randStr.substr(12, 3), "-",
            ((nbr*4|0)+8).toString(16), // [89ab]
            randStr.substr(15, 3), "-",
            randStr.substr(18, 12)
        ].join("");
    },

    validParams: function(req, res, keys) {
        if (!PlayfinityConfig.authenticationEnabled) {
            return true;
        }
        // make sure the token fields match the request fields
        var decodedToken = authN.splitAuthToken(req.param("auth"));
        for (var key in keys) {
            if (decodedToken==null || decodedToken[key]!=req.params[key]) {
                res.statusCode = 401;
                res.end('Request denied: token fields do not match request fields.');
                return false;
            }
        }
        return true;
    },

    cors: function(req, res, next) {
        var oneof = false;
        if (req.headers.origin) {
            //console.log("req.headers.origin=" + req.headers.origin);
            res.set('Access-Control-Allow-Origin', req.headers.origin);
            res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE, HEAD');
            res.set('Access-Control-Allow-Headers', 'Content-Type, *');
            oneof = true;
        }
        if (req.headers['access-control-request-method']) {
            res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
            oneof = true;
        }
        if (req.headers['access-control-request-headers']) {
            res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
            oneof = true;
        }
        if (oneof) {
            res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
        }

        // intercept OPTIONS method
        if (oneof && req.method == 'OPTIONS') {
            //console.log("cors intercept OPTIONS");
            res.send(200);
        } else {
            next();
        }
    }
};

module.exports = Utils;

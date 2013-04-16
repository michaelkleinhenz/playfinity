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

var express = require('express');
var logger = require('winston');
var serializer = require('serializer');

var app = module.exports = express();

var tokenStore = [];

function getAccessToken(req, res, next) {
    var accessToken = createAccessToken();

    var responseJson = {
        "access_token":accessToken,
        "token_type":"Bearer",
        "expires_in":3600
    };

    res.set(
        {
            'Content-Type': 'application/json;charset=UTF-8',
            'Cache-Control': 'no-store',
            'Pragma': 'no-cache'
        }
    );

    res.json(200, responseJson);

    function createAccessToken() {
        var mySerializer = serializer.createSecureSerializer("Crypt_Key", "Sign_Key");
        var userId = 12345;
        var clientId = 67890;
        var extraData = "MyExtraData";
        var token = mySerializer.stringify([userId, clientId, +new Date], extraData);
        tokenStore.push(token);
        logger.debug("Serializer - parse()" +       mySerializer.parse(token));
        return token;
    }
}

function validateAccessToken(req, res, next) {
    var accessToken = req.params.accessToken;
    var hasToken = Utils.arrayContains(tokenStore, accessToken);
    var responseJson = {
        "valid": hasToken
    };
    res.json(200, responseJson);
}

// Setup routes
app.get('/authorize', getAccessToken);
app.get('/validate/:accessToken', validateAccessToken);

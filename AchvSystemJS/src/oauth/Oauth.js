var express = require('express');
var logger = require('winston');
var serializer = require('serializer');

var app = module.exports = express();

function getAccessToken(req, res, next) {
    var accessToken = createAccessToken();

    var responseJson = {
        "access_token":accessToken,
        "token_type":"Bearer",
        "expires_in":3600,
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
        logger.debug("Serializer - parse()" +       mySerializer.parse(token));
        return token;
    }
}

// Setup routes
app.get('/authorize', getAccessToken);

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
var winston = require('winston');
var fs = require('fs');

function start(achvSystem) {
    "use strict";

    function getIndexHtml(req, res, next) {
        fs.readFile('pages/index.html', function (err, data) {
            res.writeHead(200, {'Content-Type': 'text/html', 'Content-Length': data.length});
            res.write(data);
            res.end();
        });
    }

    function triggerEvent(req, res, next) {
        var event = {
            "tsInit": new Date().getTime(),
            "eventId": req.params.eventId,
            "gameId": req.params.gameId,
            "userId": req.params.userId
        };
        if (!event.tsInit) {
            event.tsInit =  Date.now() / 1000;
        }
        winston.debug("triggerEvent - event: " + JSON.stringify(event));
        achvSystem.triggerEvent(event, function (achievement) {
            winston.debug(JSON.stringify(achievement));
        });
        res.status(204);
        res.send();
    }

    function cors(req, res, next) {
        console.log("cors headers" + JSON.stringify(req.headers));
        console.log("req.method=" + req.method);
        console.log("cors body" + JSON.stringify(req.body));
        var oneof = false;
        if (req.headers.origin) {
            console.log("req.headers.origin=" + req.headers.origin);
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
            console.log("cors intercept OPTIONS");
            res.send(200);
        } else {
            next();
        }
    }

    // Setup server
    var app = express();
    app.use(express.bodyParser());
    app.set('name', 'QBadge');

    // enable cors
    app.use(cors);

    // setup component paths
    app.use('/oauth', require('./../oauth/Oauth'));
    app.use('/store', require('./../store/Store'));

    // setup direct paths
    app.get('/event/:gameId/:userId/:eventId', triggerEvent);

    // Setup static html route
    app.get('/', getIndexHtml);

    // Run Server
    app.listen(8080, function () {
        winston.info(app.get('name') + " listening at port 8080");
    });
}

exports.start = start;

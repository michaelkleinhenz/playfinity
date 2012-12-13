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
        var event = req.body;
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
    app.use(cors); // enable cors

    app.set('name', 'Achievement-System');
    app.use('/oauth', require('./../oauth/Oauth'));
    app.use('/store', require('./../store/Store'));

    // Setup routes
    app.get('/', getIndexHtml);
    app.put('/achv/event', triggerEvent);

    // Run Server
    app.listen(8383, function () {
        winston.info(app.get('name') + " listening at port 8383");
    });
}

exports.start = start;

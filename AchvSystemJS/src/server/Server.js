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
            winston.debug(achievement);
        });
        res.status(204);
        res.send();
    }

    /**
     * Creates achievement instances from the achievement models for the requested user and game.
     * Therefore this method must be called before the game starts to trigger events.
     *
     * @param req.params.userId - The idendification of the user
     * @param req.params.gameId - The identification of the game
     */
    function initAchievements(req, res, next) {
        var id = {
            "userId": parseInt(req.params.userId, 10),
            "gameId": parseInt(req.params.gameId, 10)
        };
        achvSystem.initAchievements(id, function (error, result) {
            if (error) {
                res.json(500, error);
            } else {
                res.json(200, result);
            }
        });
    }

    function registerAchievement(req, res, next) {
        achvSystem.registerAchievement(req.params);
        res.status(204);
        res.send();
    }

    function getAchievements(req, res, next) {
        res.json(200, achvSystem.getAchievements());
    }

    // Setup server
    var app = express();
    app.use(express.bodyParser());
    app.set('name', 'Achievement-System');
    app.use('/oauth', require('./../oauth/Oauth'));
    app.use('/store', require('./../store/Store'));

    // Setup routes
    app.get('/', getIndexHtml);
    app.put('/achv/event', triggerEvent);
    app.post('/achv/init/:userId/:gameId', initAchievements);
    app.put('/achv', registerAchievement);
    app.get('/achv', getAchievements);

    // Run Server
    app.listen(8080, function () {
        winston.info(app.get('name') + " listening at port 8080");
    });
}

exports.start = start;

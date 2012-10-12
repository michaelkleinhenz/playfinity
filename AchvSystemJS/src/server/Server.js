var express = require('express');
var winston = require('winston');
var fs = require('fs');

function start(achvSystem) {

    function getIndexHtml(req, res, next) {
          fs.readFile('pages/index.html', function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/html', 'Content-Length': data.length});
            res.write(data);
            res.end();
        });
    }

    function triggerEvent(req, res, next) {
    var event = req.body;
    if (!event.tsInit) {
        event.tsInit =  Date.now()/1000;
    }
    winston.debug("triggerEvent - event: " + JSON.stringify(event));
	achvSystem.triggerEvent(event, function(achievement) {
	    // TODO remove callback when notification mechanism is done.
	    winston.debug(achievement);
	});
	res.status(204);
	res.send();
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
    app.put('/achv', registerAchievement);
    app.get('/achv', getAchievements);

    // Run Server
    app.listen(8080, function() {
        winston.info(app.get('name') + " listening at port 8080");
    });
}

exports.start = start;

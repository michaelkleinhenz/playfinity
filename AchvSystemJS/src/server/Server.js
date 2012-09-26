var restify = require('restify');
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
	achvSystem.triggerEvent(req.params, function(achievement) {
	    // TODO remove callback when notification mechanism is done.
	    console.log(achievement);
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
    var server = restify.createServer();
    server.use(restify.bodyParser());

    // Setup routes
    server.get('/', getIndexHtml);
    server.put('/achv/event', triggerEvent);
    server.put('/achv', registerAchievement);
    server.get('/achv', getAchievements);

    // Run Server
    server.listen(8080, function() {
	console.log('%s listening at %s', server.name, server.url);
    });
}

exports.start = start;

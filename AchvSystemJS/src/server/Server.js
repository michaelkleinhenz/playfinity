var restify = require('restify');

function start(achvSystem) {
    function respond(req, res, next) {
	res.send('hello ' + req.params.name);
    }

    function triggerEvent(req, res, next) {
	achvSystem.triggerEvent(req.params);
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
    server.get('/hello/:name', respond);
    server.head('/hello/:name', respond);
    server.put('/achv/event', triggerEvent);
    server.put('/achv', registerAchievement);
    server.get('/achv', getAchievements);

    // Run Server
    server.listen(8080, function() {
	console.log('%s listening at %s', server.name, server.url);
    });
}

exports.start = start;

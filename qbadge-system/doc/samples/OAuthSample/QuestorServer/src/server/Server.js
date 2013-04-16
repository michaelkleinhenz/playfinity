var restify = require('restify');
var fs = require('fs');

function start() {
    function respond(req, res, next) {
    	res.send('hello ' + req.params.name);
    }

    function getAchievements(req, res, next) {
        fs.readFile('pages/index.html', function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/html', 'Content-Length': data.length});
            res.write(data);
            res.end();
        });
    }

    // Setup server
    var server = restify.createServer();
    server.use(restify.bodyParser());

    // Setup routes
    server.get('/hello/:name', respond);
    server.head('/hello/:name', respond);
    server.get('/achv', getAchievements);

    // Run Server
    server.listen(8282, function() {
	console.log('%s listening at %s', server.name, server.url);
    });
}

exports.start = start;

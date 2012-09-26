var express = require('express');
var winston = require('winston');

var app = module.exports = express();

function readAchievement(req, res, next) {
    winston.info('readAchievement()');
    res.json(200, {"name":"myAchievement"})
}

function createAchievement(req, res, next) {
    winston.info('createAchievement()');
    res.status(204);
	res.send();
}

// Setup routes
app.get('/', readAchievement);
app.put('/', createAchievement);

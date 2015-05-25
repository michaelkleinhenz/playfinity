/*
 * Playfinity
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

var crypto = require("crypto");
var nano = require("nano")(PlayfinityConfig.couchUrl);

var design = {
    "_id" : "_design/leaderboard",
    "views" : {
        "byId" : {
            "map" : "function(doc){ emit(doc.leaderboardId, doc)}"
        },
        "byGameId" : {
            "map" : "function(doc){ emit(doc.gameId, doc)}"
        },
        "byOwnerId" : {
            "map" : "function(doc){ emit(doc.ownerId, doc)}"
        },
        "byTimestamp" : {
            "map" : "function(doc){emit(doc.timestamp, doc)}"
        },
        "byOwnerAndGame" : {
            "map" : "function(doc){ emit([doc.ownerId, doc.gameId, doc.leaderboardId], doc)}"
        },
        "byActive" : {
            "map" : "function(doc){if (doc.active) emit([doc.ownerId, doc.gameId, doc.leaderboardId, doc.userId], doc)}"
        },
        "byLeaderboard" : {
            "map" : "function(doc){if (doc.active) emit([doc.ownerId, doc.gameId, doc.leaderboardId, doc.score, -1*doc.epoch], doc)}"
        },
        "byUserId" : {
            "map" : "function(doc){if (doc.active) emit([doc.ownerId, doc.userId], doc)}"
        },
        "findGameLeaderboard" : {
            "map" : "function(doc){emit([doc.userId, doc.ownerId, doc.gameId, doc.leaderboardId, -1*doc.epoch], 1)}",
            "reduce": "function(keys, values, rereduce) { var max = 0, ks = rereduce ? values : keys; for (var i = 1, l = ks.length; i < l; ++i) { if (ks[max][0][4] < ks[i][0][4]) max = i; } return ks[max]; }"
        }
    }
};

exports.checkDatabase = function(callback) {
    nano.db.get(PlayfinityConfig.leaderboardDbName, function(error, body) {
        if (error) {
            Logger.info("Creating database " + PlayfinityConfig.leaderboardDbName + ": " + error);
            //if (typeof PlayfinityConfig.createDb!="undefined" && PlayfinityConfig.createDb)
                nano.db.create(PlayfinityConfig.leaderboardDbName, function(err, body) {
                    if (!err) {
                        Logger.info("Database created.");
                    } else {
                        Logger.info("Error creating database.");
                    }
                    callback();
                });
        } else {
            Logger.info("Using existing database.");
            callback();
        }
    });
};

exports.updateDatabaseViews = function() {
    exports.checkDatabase(function() {
        leaderboardDB.get("_design/leaderboard", { revs_info: true }, function(error, body) {
            if (!error) {
                Logger.info("Updating existing leaderboard views.");
                design._rev = body._rev;
            } else
                Logger.info("New database, creating leaderboard views.");
            leaderboardDB.insert(design, "_design/leaderboard", function(error, body) {
                if (error)
                    Logger.error("Error creating/updating leaderboard views: " + JSON.stringify(error));
                else
                    Logger.info("Successfully created/updated leaderboard views.");
            });
        });
    });
};

exports.addScore = function(scoreEntry, mode, successCallback, failCallback) {

    // FIXME: add more modes: latest and highest

    // calculate id
    var date = new Date();
    var idText = (scoreEntry.ownerId + scoreEntry.gameId + scoreEntry.leaderboardId + scoreEntry.userId + date.getTime());
    var sha256 = crypto.createHash("sha256");
    sha256.update(idText, "utf8");
    var entryId = sha256.digest("base64");

    // create entry structure
    var leaderboardEntry = {
        _id: entryId,
        type: "leaderboardEntry",
        ownerId: scoreEntry.ownerId,
        gameId: scoreEntry.gameId,
        leaderboardId: scoreEntry.leaderboardId,
        userId: scoreEntry.userId,
        score: scoreEntry.score,
        timestamp: date,
        epoch: date.getTime(),
        extraData: scoreEntry.extraData,
        active: true
    };

    // make last leaderboard entry inactive
    var filter = [scoreEntry.ownerId, scoreEntry.gameId, scoreEntry.leaderboardId, scoreEntry.userId ];
    leaderboardDB.view("leaderboard", "byActive", { key: filter }, function(error, body) {
        if (body.rows.length>1) {
            var error = "Filter by active returned more than one row. Inconsistent data for filter " + JSON.stringify(filter);
            Logger.error(error);
            failCallback(error);
        }
        else {
            if (body.rows.length==1) {
                // update set active to false
                var updatedEntry = body.rows[0].value;
                updatedEntry.active = false;
                leaderboardDB.insert(updatedEntry, function (error) {
                    if (error) {
                        Logger.error("Error updating existing leaderboardEntry:" + JSON.stringify(error));
                        failCallback(error);
                    } else {
                        // insert new entry
                        exports.insertLeaderboardEntry(leaderboardEntry, successCallback, failCallback);
                    }
                })
            } else
                // insert new entry
                exports.insertLeaderboardEntry(leaderboardEntry, successCallback, failCallback);
        }
    })
};

exports.insertLeaderboardEntry = function(leaderboardEntry, successCallback, failCallback) {
    // add to database
    leaderboardDB.insert(leaderboardEntry, function (error) {
        if (error) {
            Logger.error("Error adding new leaderboardEntry:" + JSON.stringify(error));
            failCallback(error);
        } else
            successCallback(leaderboardEntry);
    });
};

exports.setPlayerInactive = function(ownerId, userId, successCallback, failCallback) {
    var filter = [ ownerId, userId ];
    leaderboardDB.view("leaderboard", "byUserId", { key: filter }, function(error, body) {
        if (error) {
            Logger.error("Error getting player leaderboard entry: " + JSON.stringify(error));
            failCallback(error);
        } else {
            Async.each(body.rows, function(item, callback) {
                var thisEntry = item.value;
                if (thisEntry.active) {
                    thisEntry.active = false;
                    leaderboardDB.insert(thisEntry, function (error) {
                        if (error) {
                            Logger.error("Error updating existing leaderboardEntry:" + JSON.stringify(error));
                            callback(error);
                        } else
                            callback();
                    })
                } else
                    callback();
            }, function(updateError) {
                if (updateError)
                    // at least one of the updates produced an error
                    failCallback(updateError);
                else
                    successCallback({});
            });
        }
    });
};

exports.getAllEntries = function(ownerId, gameId, leaderboardId, successCallback, failCallback)  {
    var filter = [ ownerId, gameId, leaderboardId ];
    leaderboardDB.view("leaderboard", "byOwnerAndGame", { key: filter }, function(error, body) {
        if (error) {
            Logger.error("Error getting game entries: " + JSON.stringify(error));
            failCallback(error);
        } else {
            var result = [];
            for (var i=0; i<body.rows.length; i++) {
                var thisEntry = body.rows[i].value;
                result.push(thisEntry);
            }
            successCallback(result);
        }
    });
};

exports.getLeaderboard = function(ownerId, gameId, leaderboardId, limit, skip, successCallback, failCallback) {
    var endkey = [ ownerId, gameId, leaderboardId, 0, 0 ];
    var startkey = [ ownerId, gameId, leaderboardId, {}, {} ];
    var options = {
        descending: true,
        startkey: startkey,
        endkey: endkey
    };
    if (limit && limit!=null && limit!="")
        options.limit = limit;
    if (skip && skip!=null && skip!="")
        options.skip = skip;
    leaderboardDB.view("leaderboard", "byLeaderboard", options, function(error, body) {
        if (error) {
            Logger.error("Error getting game leaderboard: " + JSON.stringify(error));
            failCallback(error);
        } else {
            var result = [];
            for (var i=0; i<body.rows.length; i++) {
                var thisEntry = body.rows[i].value;
                thisEntry.position = i;
                if (skip && skip!=null && skip!="")
                    thisEntry.position = thisEntry.position+skip;
                result.push(thisEntry);
            }
            successCallback(result);
        }
    });
};

exports.getPlayerLeaderboardEntry = function(ownerId, gameId, leaderboardId, userId, successCallback, failCallback) {
    var filter = [ ownerId, gameId, leaderboardId, userId];
    leaderboardDB.view("leaderboard", "byActive", { key: filter }, function(error, body) {
        if (error) {
            Logger.error("Error getting player leaderboard entry: " + JSON.stringify(error));
            failCallback(error);
        } else
            if (body.rows.length!=1) {
                var errorMsg = "Filter by active returned more than one row. Inconsistent data for filter " + JSON.stringify(filter);
                Logger.error(errorMsg);
                failCallback(errorMsg);
            } else {
                var thisEntry = body.rows[0].value;
                // TODO: retrieve position
                thisEntry = 42;
                successCallback(thisEntry);
            }
    });
};

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
            "map" : "function(doc){emit(doc.timestamp, 1)}"
        },
        "findGameLeaderboard" : {
            "map" : "function(doc){emit(doc.timestamp, 1)}"
        },
        "findPlayerEntry" : {
            "map" : "function(doc){emit(doc.timestamp, 1)}"
        }
    }
};

exports.updateDatabaseViews = function() {
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
};

exports.addScore = function(scoreEntry, successCallback, failCallback) {

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
        extraData: scoreEntry.extraData
    };

    // add to database
    leaderboardDB.insert(leaderboardEntry, function (error) {
        if (error) {
            Logger.error("Error adding leaderboardEntry:" + JSON.stringify(error));
            failCallback(error);
        } else
            successCallback(leaderboardEntry);
    });
};

exports.getGameLeaderboard = function(ownerId, gameId, leaderboardId, timeframe, mode, successCallback, failCallback) {
    //?descending=true&limit=10&include_docs=true
    leaderboardDB.view("leaderboard", "byTimestamp", { "descending": false, "include_docs": true }, function(error, body) {
        if (error) {
            Logger.error("Error getting game leaderboard: " + JSON.stringify(error));
            failCallback(error);
        } else
            successCallback((typeof body=="undefined")?body:body.rows);
    });
};

exports.getPlayerLeaderboardEntry = function(ownerId, gameId, leaderboardId, timeframe, userId, mode, successCallback, failCallback) {
    db.view("leaderboard", "byTimestamp", { "keys": ["key1", "key2", "key_n"] }, function(error, body) {
        if (error) {
            Logger.error("Error getting game leaderboard: " + JSON.stringify(error));
            failCallback(error);
        } else
            successCallback((typeof body=="undefined")?body:body.rows);
    });
};

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

/*
 * Functions for operations on game data.
 */

gameStore = function(conf) {
    var db = conf.db;
    var logger = conf.logger;
    var self = {};

    self.getGame = function (gameId, callback) {
        db.view('game', 'byGameId', {"key": gameId}, function(error, body) {
            if (error) {
                logger.error("Not able to get game: gameId=" + gameId +
                    ", error=" + JSON.stringify(error));
            }
            callback(error, (typeof body=="undefined")?body:body.rows);
        });
    };

    self.deleteGame = function (game, callback) {
        db.destroy(game.id, game.revision, function(error, body) {
            if (error) {
                logger.error("Not able to delete game: gameId=" + game.id +
                    ", revision=" + game.revision +
                    ", error" + JSON.stringify(error));
            }
            callback(error);
        });
    };

    self.createOrUpdateGame = function (game, callback) {
        game._id = game.gameId;
        db.insert(game, function (error, body, headers) {
            if (error) {
                logger.error("Not able to insert game" +
                    JSON.stringify(game) + " Reason:" + error);
            }
            callback(error);
        });
    };

    return self;
}

exports.gameStore = gameStore;
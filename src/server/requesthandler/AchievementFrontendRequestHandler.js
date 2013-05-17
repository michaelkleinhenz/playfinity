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

/**
 * Handler for frontend requests on achievment model data. Needs configuration with "achievementStore" and "logger".
 *
 * @param achievementStore
 * @param logger
 * @returns {{}}
 */
achievementFrontendRequestHandler = function(achievementStore, logger) {
    var self = {};

    self.getFrontendAchievementRulesByOwnerIdAndId = function(req, res, next) {
        achievementStore.getAchievementById(req.param("id"), function(error, result) {
            var output = [];
            if (typeof req.param("ownerId")=="undefined" || req.param("ownerId")==null || req.param("ownerId")!=result[0].value.ownerId)
                res.json({
                    "Result":"ERROR",
                    "Message": "Authorization failed.",
                    "TotalRecordCount":0,
                    "Records":[]})
            else
                res.json(Utils.toJTableResult(req.param("jtStartIndex"), req.param("jtPageSize"), req.param("jtSorting"), Utils.arrayNormalize(output, result[0].value.process)));
        });
    }

    self.getFrontendAchievementRulesJSONByOwnerIdAndId = function(req, res, next) {
        achievementStore.getAchievementById(req.param("id"), function(error, result) {
            var output = [];
            if (typeof req.param("ownerId")=="undefined" || req.param("ownerId")==null || req.param("ownerId")!=result[0].value.ownerId)
                res.json({
                    "Result":"ERROR",
                    "Message": "Authorization failed.",
                    "TotalRecordCount":0,
                    "Records":[]})
            else
                res.json({
                    "Result":"OK",
                    "TotalRecordCount":1,
                    "Records":[{
                        "process": result[0].value.process
                    }]});
        });
    }

    self.getFrontendAchievementsByOwnerId = function(req, res, next) {
        achievementStore.getAchievementsByOwnerId(req.param("ownerId"), function(error, result) {
            if (error) {
                res.json({
                    "Result":"ERROR",
                    "Message": error,
                    "TotalRecordCount":0,
                    "Records":[]})
            } else {
                res.json(Utils.toJTableResult(req.param("jtStartIndex"), req.param("jtPageSize"), req.param("jtSorting"), result));
            }
        });
    }

    self.createFrontendAchievement = function(req, res, next) {
        // FIXME check if process is valid JSON
        // FIXME check if gameId belongs to ownerId
        var doc = {
            gameId: req.body.gameId,
            ownerId: req.body.ownerId,
            name: {
                en: req.body.name_en,
                de: req.body.name_de
            },
            description: {
                en: req.body.description_en,
                de: req.body.description_de
            },
            imageURI: req.body.imageURI,
            frequencyCounterMax: req.body.frequencyCounterMax,
            process: JSON.parse(req.body.process)
        };
        achievementStore.createAchievement(doc, function (error, body) {
            if (error) {
                res.json({
                    "Result":"ERROR",
                    "Message": error
                });
                res.send(404);
                logger.error("Not able to insert " + doc + " Reason:" + error);
            } else
                logger.debug(JSON.stringify(body));
            res.json({
                "Result":"OK",
                "Record": doc
            });
        });
    };

    return self;
}

exports.achievementFrontendRequestHandler = achievementFrontendRequestHandler;

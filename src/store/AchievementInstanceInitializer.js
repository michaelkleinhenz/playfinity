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
 * Functions for creating instances from models.
 */

/*global ACHV*/
(function () {
    "use strict";

    ACHV.achievementInstanceInitializer = function (conf) {
        var self = {},
            achvModelStore = conf.achvModelStore,
            achvInstanceStore = conf.achvInstanceStore;

        self.initAchievementInstances = function (id, next) {

            achvModelStore.getAchievementsByOwnerIdAndGameId(id.ownerId, id.gameId, createInstances);

            function createInstances(error, rows) {
                if (error) {
                    console.log("Not able to get achievements for id=" + JSON.stringify(id));
                    next(error, null);
                } else {
                    if (rows.length > 0) {
                        rows.forEach(createAchievementInstance);
                    } else {
                        console.log("No achievements for id:"  + JSON.stringify(id));
                    }

                    next(null, "Achievement instances created");
                }
                function createAchievementInstance(doc) {
                    var achievementInstance = doc.value;
                    if (achievementInstance.active) {
                        delete achievementInstance._id;
                        delete achievementInstance._rev;
                        delete achievementInstance.active;
                        achievementInstance.userId = id.userId;
                        achievementInstance.frequencyCounter = 0;
                        achievementInstance.locked = true; // TODO only temporarly until cabinet exists.
                        achvInstanceStore.createOrUpdateAchievementInstance(achievementInstance, function (error, body) {
                            if (error) {
                                console.log("Not able to create achievement instance for doc: " + JSON.stringify(doc) + " Error:" + error);
                            } else {
                                console.log("Created achievement instance. body:" + JSON.stringify(body));
                            }
                        });
                    } else {
                        console.log("Not active achievement=" + JSON.stringify(achievementInstance));
                    }
                }
            }
        };
        return self;
    };

    exports.achievementInstanceInitializer = ACHV.achievementInstanceInitializer;

}());
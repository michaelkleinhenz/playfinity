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
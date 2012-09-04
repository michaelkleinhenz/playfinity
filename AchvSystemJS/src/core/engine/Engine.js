var engine = function(spec) {
    var that = {};

    that.getAchievementType = function() {
        return spec.achievementType;
    };

    that.unlockAchievement = function(achievement, notifyUnlockCallback) {
        achievement.unlockCounter = achievement.unlockCounter + 1;
        if (achievement.unlockCounter >= achievement.UNLOCK_COUNTER_MAX) {
            achievement.locked = false;
            notifyUnlockCallback(achievement);
        }
    };
    return that;
};
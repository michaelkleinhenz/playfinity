SYSTEM = {};

SYSTEM.Environment = function Environment() {};

SYSTEM.Environment.prototype.init = function () {
    var engines = new HashMap();
    var achievements = new HashMap();
    var achievementEngine = new ACHV.AchievementEngine(engines, achievements);
    var oneShotEngine = new ACHV.OneShotEngine();
    achievementEngine.registerEngine(oneShotEngine);
    this.achievementSystem = new ACHV.AchievementSystem(achievementEngine);
};

SYSTEM.Environment.prototype.getAchievementSystem = function() {
	return this.achievementSystem;
};
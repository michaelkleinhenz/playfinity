ROLE = {};

ROLE.Author = function Author(environment) {
	this.environment = environment;
};

ROLE.Author.prototype.createAchievement = function() {
	var achievementSystem = this.environment.getAchievementSystem();
	var achievement = FIXTURE.getStartGameAchievement();
	achievementSystem.registerAchievement(achievement);
};
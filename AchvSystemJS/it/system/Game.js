SYSTEM.Game = function Game(player, environment) {
	this.player = player;
	this.environment = environment;
	this.achievementSystem = environment.getAchievementSystem();
};

SYSTEM.Game.prototype.startGame = function() {
	this.achievementSystem.registerGame(this);
};

SYSTEM.Game.prototype.doSomething = function() {
	var player = this.player;
	var event = FIXTURE.getStartGameEvent();
	this.achievementSystem.triggerEvent(event, function unlockAchievement(achievementName) {
		player.showAchievement(achievementName);
	});
};
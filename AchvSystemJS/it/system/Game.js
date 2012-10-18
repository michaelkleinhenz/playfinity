/*global SYSTEM, FIXTURE*/

SYSTEM.Game = function Game(player, environment) {
	this.player = player;
	this.environment = environment;
	this.achievementSystem = environment.getAchievementSystem();
};

SYSTEM.Game.prototype.startGame = function() {
	this.achievementSystem.registerGame(this);
};

SYSTEM.Game.prototype.doSomething = function() {
    var player = this.player,
        event = FIXTURE.getStartGameEvent();
    this.achievementSystem.triggerEvent(event, function unlockAchievement(achievements) {
        if (achievements.length > 0) {
            player.showAchievement(achievements);
        }
    });
};
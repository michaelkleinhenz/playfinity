ROLE.Player = function Player(environment) {
	this.environment = environment;
	this.isNotified = false;
};

ROLE.Player.prototype.startGame = function() {
	this.game = new SYSTEM.Game(this, this.environment);
	this.game.startGame();
};

ROLE.Player.prototype.doSomething = function() {
	this.game.doSomething();
};

ROLE.Player.prototype.showAchievement = function(achievement) {
	this.isNotified = true;
};
					  
ROLE.Player.prototype.isNotifiedForAchievement = function() {
	return this.isNotified;
};

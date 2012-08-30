TestCase("Re7Test", {
	testRequirement: function() {
		// init environment
		var environment = new SYSTEM.Environment();
		environment.init();
		
		// new achievement
		var author = new ROLE.Author(environment);
		author.createAchievement();
		
		var player = new ROLE.Player(environment);
		player.startGame();
		player.doSomething();
		
		assertTrue(player.isNotifiedForAchievement());
	}
});
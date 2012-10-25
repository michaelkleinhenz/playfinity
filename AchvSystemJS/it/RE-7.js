/*global SYSTEM, ROLE*/
TestCase("Re7Test", {
    testRequirement: function () {
        "use strict";
        var environment = new SYSTEM.Environment(),
            author = new ROLE.Author(environment),
            player = new ROLE.Player(environment);

        environment.init();
        author.createAchievement();
        player.startGame();
        player.doSomething();

        assertTrue(player.isNotifiedForAchievement());
    }
});
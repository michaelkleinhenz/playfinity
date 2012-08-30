TestCase("UnlockRuleTest", {
	testCreateUnlockRule: function() {
		var unlockRule = new ACHV.UnlockRule("MyUnlockRule");
		assertEquals("MyUnlockRule", unlockRule.name);
	},
	
	testIsSatisfied: function() {
		var unlockRule = new ACHV.UnlockRule("MyUnlockRule");
		unlockRule.addUnlockEvent("UnlockEvent");
		var events = ["UnlockEvent"];
		assertTrue(unlockRule.isSatisfied(events));
	},
	
	testIsNotSatisfied: function() {
		var unlockRule = new ACHV.UnlockRule("MyUnlockRule");
		unlockRule.addUnlockEvent("UnlockEvent");
		var events = ["NotUnlockEvent"];
		assertFalse(unlockRule.isSatisfied(events));
	}
});



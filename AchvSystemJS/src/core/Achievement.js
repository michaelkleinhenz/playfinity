ACHV = {};

ACHV.Achievement = function(name) {
	this.name = name;
	this.unlockRules = [];
	this.events = [];
	this.eventCounter = 0;
	this.locked = true;
};

ACHV.Achievement.prototype.addUnlockRule = function(unlockRule) {
	this.unlockRules.push(unlockRule);
};

ACHV.Achievement.prototype.getEventCounterValue = function() {
	return this.eventCounter;
};

ACHV.Achievement.prototype.processEvent = function(event, notifyUnlocked) {
	this.events.push(event);
	if (event === "CorrespondingEvent") {
		this.eventCounter = this.eventCounter + 1;
	}
	if (areRulesSatisfied(this.unlockRules, this.events)) {
		this.locked = false;
		notifyUnlocked(this.name);
	}
	
	function areRulesSatisfied(unlockRules, events) {
		var rulesSatisfied = true;
		var i;
		for (i = 0; i < unlockRules.length; i++) {
			var currentRule = unlockRules[i];
			if (!currentRule.isSatisfied(events)) {
				rulesSatisfied = false;
				break;
			}
		}
		return rulesSatisfied;
	}
};

ACHV.Achievement.prototype.isUnlocked = function() {
	return !this.locked;
};
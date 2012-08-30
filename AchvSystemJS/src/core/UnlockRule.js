ACHV.UnlockRule = function(name) {
    this.name = name;
};

ACHV.UnlockRule.prototype.addUnlockEvent = function(event) {
    this.unlockEvent = event;
};

ACHV.UnlockRule.prototype.isSatisfied = function(events) {
    return Utils.arrayContains(events, this.unlockEvent);
};
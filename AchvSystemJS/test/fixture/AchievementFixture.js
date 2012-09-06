FIXTURE = {
	
	getFixtureContent : function(fixtureFileName) {
	    var url ='/test/test/fixture/' + fixtureFileName;
	    var request = new XMLHttpRequest();
	    request.open('GET', url, false);
	    request.send(null);
	    return request.responseText;
	},
	
	getFixtureObj: function(fixtureFileName) {
		  var json = FIXTURE.getFixtureContent(fixtureFileName);
		  var obj = JSON.parse(json);
		  return obj;
	},
	
	getStartGameEvent: function() {
	    return FIXTURE.getFixtureObj("StartGameEvent.json");
	},

    getStopGameEvent: function(){
        return FIXTURE.getFixtureObj("event/StopGameEvent.json");
    },
	
	getStartGameAchievement: function() {
	    return FIXTURE.getFixtureObj("achievement/StartGameAchievement.json");
	},

	getFirstStartAchievement: function() {
	    return FIXTURE.getFixtureObj("achievement/FirstStartAchievement.json");
	},
	
	getHeadShotEvent: function() {
	    return FIXTURE.getFixtureObj("HeadShotEvent.json");
	},
	
	getTenHeadShotsAchievement: function() {
	    return FIXTURE.getFixtureObj("achievement/TenHeadShotsAchievement.json");
	},
	
	getKneeShotEvent: function() {
	    return FIXTURE.getFixtureObj("KneeShotEvent.json");
	},
	
	getTenHeadAndKneeShotsAchievement: function() {
	    return FIXTURE.getFixtureObj("achievement/TenHeadAndKneeShotsAchievement.json");
	},

    getPlayForTenSecondsAchievement: function() {
        return FIXTURE.getFixtureObj("achievement/PlayForTenSecondsAchievement.json");
    },

    getTenHeadShotsInTenMinutesAchievement: function() {
        return FIXTURE.getFixtureObj("achievement/TenHeadShotsInTenMinutesAchievement.json");
    }
};

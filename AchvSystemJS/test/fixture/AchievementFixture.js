FIXTURE = {
	
	getFixtureContent : function(fixtureFileName) {
	    var url ='/test/test/fixture/' + fixtureFileName;
	    request = new XMLHttpRequest();
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
	
	getStartGameAchievement: function() {
	    return FIXTURE.getFixtureObj("StartGameAchievement.json");
	},
	
	getHeadShotEvent: function() {
	    return FIXTURE.getFixtureObj("HeadShotEvent.json");
	},
	
	getTenHeadShotsAchievement: function() {
	    return FIXTURE.getFixtureObj("TenHeadShotsAchievement.json");
	},
	
	getKneeShotEvent: function() {
	    return FIXTURE.getFixtureObj("KneeShotEvent.json");
	},
	
	getTenHeadAndKneeShotsAchievement: function() {
	    return FIXTURE.getFixtureObj("TenHeadAndKneeShotsAchievement.json");
	}
};

FIXTURE.MyAchievement = new ACHV.Achievement("MyAchievement");
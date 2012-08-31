var Utils = {
    arrayContains : function(array, obj) {
	var i = array.length;
	while (i--) {
	    if (array[i] === obj) {
		return true;
	    }
	}
	return false;
    },
    
    mapRemoveArrayValue: function(map, key, arrayValue) {
	var values = map.get(key);
	for(var i in values){
	    if(values[i] == arrayValue) {
		values.splice(i,1);
	        break;
	    }
	 }
	map.set(key, values);
    }
};

module.exports = Utils;

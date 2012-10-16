var Utils = {
    arrayContains : function(array, obj) {
        var i = array.length;
        while (i--) {
            if (array[i] === obj) {
                return true;
            }
        }
        return false;
    }
};

module.exports = Utils;

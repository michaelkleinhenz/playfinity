TestCase("UtilsTest", {

    testMapRemoveArrayValue : function() {
        var map = new HashMap();
        map.set("MyKey", ["ValueOne", "ValueTwo", "ValueThree"]);
        Utils.mapRemoveArrayValue(map, "MyKey", "ValueTwo");
        var resultValues = map.get("MyKey");
        assertEquals(["ValueOne", "ValueThree"], resultValues);
    }
});

seajs.use('ent', function(ent) {
	module("living with sea.js");
	test("not overriding define or any seajs.use", function() {
		ok(ent.iF(seajs.config), 'seajs.config should exist');
	});
});

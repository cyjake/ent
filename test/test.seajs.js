define('foo', [], { hello: 'foo' })

seajs.use(['foo', 'ent'], function(foo, ent) {

	module("coexist with Sea.js")

    test("not overriding define or any seajs.use", function() {
        equal(foo.hello, 'foo', 'defined modules goes into seajs')
		ok(ent.iF(seajs.config), 'seajs.config should exist')
	})
})

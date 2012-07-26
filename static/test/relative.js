define('foo/bar/ham', function(require, exports) {
    exports.monty = 'python'
})
define('foo/bar/egg', function(require, exports) {
    var ham = require('./ham')

    exports.matz = 'ruby'
    exports.monty = ham.monty
})
define('foo/bar/egg/sided', function(require, exports) {
    var ham = require('../ham'),
        egg = require('../egg'),
        ent = require('ent')

    ent.mix(exports, egg)
})
define('foo/bar/egg/sided/spiced', function(require, exports) {
    var ham = require('../../ham'),
        egg = require('../../egg'),
        ent = require('ent')

    ent.mix(exports, egg)
})
define('foo/bar/egg/sided/spiced/chopped', function(require, exports) {
    var ham = require('../../../ham'),
        egg = require('../../../egg'),
        ent = require('ent')

    ent.mix(exports, egg)
})
seajs.use('ent', function(ent) {
    module('require module with relative path')
    asyncTest('./', function() {
        seajs.use('foo/bar/egg', function(egg) {
            equal(egg.monty, 'python', 'monty should python')
            equal(egg.matz, 'ruby', 'matz should ruby')
            start()
        })
    })
    asyncTest('../', function() {
        seajs.use('foo/bar/egg/sided', function(sided) {
            equal(sided.monty, 'python', 'monty should python')
            equal(sided.matz, 'ruby', 'matz should ruby')
            start()
        })
    })
    asyncTest('../../', function() {
        seajs.use('foo/bar/egg/sided/spiced', function(spiced) {
            equal(spiced.monty, 'python', 'monty should python')
            equal(spiced.matz, 'ruby', 'matz should ruby')
            start()
        })
    })
    asyncTest('../../../', function() {
        seajs.use('foo/bar/egg/sided/spiced/chopped', function(chopped) {
            equal(chopped.monty, 'python', 'monty should python')
            equal(chopped.matz, 'ruby', 'matz should ruby')
            start()
        })
    })
})
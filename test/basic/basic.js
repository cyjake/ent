// kslite 模块在创意中心的前端代码中广泛使用
// sea.js 自身并没有暴露这些代码，后来通过 seajs.pluginSDK 暴露了辅助方法；
// 所以就在其基础上自己包装一个，改叫 ent 吧
seajs.use('ent', function(ent) {
	module('ent module');
	test('iF iPO iA', function() {
		ok(ent.iF(function(){}), 'iF works');
		ok(!ent.iF({}), 'iF works');

		// iPO 是 isPlainObject 的缩写
		ok(ent.iPO({}), 'iPO works');
		ok(!ent.iPO(function(){}), 'iPO works');

		ok(!ent.iA({}), 'iA works');
	});
});
define('browser/console', [], function(require, exports, module) {
    if (window.console) {
        module.exports = console;
        return;
    }
    var out = document.createElement('textarea'),
		body = document.getElememtsByTagName('body')[0];
    
	body.appendChild(out);
	out.style.cssText = 'position:absolute;right:20px;top:20px;border:1px solid #bbb;padding:5px;';
    exports.log = function(msg) {
        out.value += '\n' + msg;
    };
});
define('japanese', ['browser/console'], function(require, exports) {
    var out = require('browser/console'); 

    exports.hello = function(name) {
        out.log('konizuwa ' + name);
    };
});
module('ent.js itself');
test('basic module definition', function() {
	var mods = seajs.data.memoizedMods;
	
	ok(mods['browser/console'], "定义 browser/console 模块");
	ok(mods['japanese'], "定义 japanses 模块");
});
seajs.use(['japanese'], function(jp) {
	test('module exports initialization', function() {
		var mods = seajs.data.memoizedMods;

		ok(mods['browser/console'].exports, 'browser/console exports 初始化完毕');
		ok(mods['japanese'].exports, 'japanese 初始化完毕');
	});
});
/* vim: softtabstop=4 tabstop=4 shiftwidth=4
 */

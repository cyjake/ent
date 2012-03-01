// **E**nt is **N**ot ksli**T**e
//
// [sea.js](http://seajs.com) 是时下很流行的 JavaScript 模块加载器。
// 在开发期很有用，配置项、模块名判定等，都非常方便。但在生产环境，
// 代码打包完毕之后，它的大部分功能都不再需要，尤其在广告投放等环境中，
// 显得臃肿，因此有了 ent.js。
//
// ent.js 基于 玉伯<<lifesinger@gmail.com>>、李牧<<limu@taobao.com>> 的工作。
// 它的名字是 **E**nt is **N**ot ksli**T**e 的缩写，向李牧的 KSLITE 致敬。
//
// KSLITE 为 [创意中心](http://chuangyi.taobao.com) 初期提供了足够的功能支持，
// 扮演了底层架构基石的角色，举足轻重。

// 与 sea.js 的几个主要差别（暂时不考虑做到一致）：
//
//  1. 不支持 `seajs.use(<js_url>)`，只能传入已经 define 过的模块名或者模块名数组
//  2. 没有 `seajs.config`，自然也没有 map、preload、alias 等
//  3. `require.async` 只不过是对 sea.js 代码的兼容，本身并没有异步调用的功能

// ### 代码起始
// 初始化全局对象
this.ent = {
    util: {},
    data: {
        config: {
            timeout: 500
        }
    }
};

// ### util.getAsset
//
// 照搬自 sea.js
//
// 要实现资源文件的 onload 监听，比想象的要复杂得多，玉伯的代码非常棒。
// 我自然没道理再整一遍。
//
// 这里有个考量，是否要去掉 CSS 部分的异步加载与 onload 回调，觉得用不太到。
(function(global, util, data) {

    var head = document.head ||
            document.getElementsByTagName('head')[0] ||
            document.documentElement;

    var UA = navigator.userAgent;
    var isWebKit = ~UA.indexOf('AppleWebKit');


    util.getAsset = function(url, callback, charset) {
        var isCSS = /\.css(?:\?|$)/i.test(url);
        var node = document.createElement(isCSS ? 'link' : 'script');

        if (charset) {
            node.charset = charset;
        }

        assetOnload(node, callback);

        if (isCSS) {
            node.rel = 'stylesheet';
            node.href = url;
            head.appendChild(node); // Keep style cascading order
        }
        else {
            node.async = 'async';
            node.src = url;

            // For some cache cases in IE 6-9, the script executes IMMEDIATELY after
            // the end of the insertBefore execution, so use `currentlyAddingScript`
            // to hold current node, for deriving url in `define`.
            currentlyAddingScript = node;
            head.insertBefore(node, head.firstChild);
            currentlyAddingScript = null;
        }
    };

    function assetOnload(node, callback) {
        if (node.nodeName === 'SCRIPT') {
            scriptOnload(node, cb);
        } else {
            styleOnload(node, cb);
        }

        var timer = setTimeout(function() {
            console.log('Time is out:', node.src);
            cb();
        }, data.config.timeout);

        function cb() {
            if (!cb.isCalled) {
                cb.isCalled = true;
                clearTimeout(timer);

                callback();
            }
        }
    }

    function scriptOnload(node, callback) {

        node.onload = node.onerror = node.onreadystatechange = function() {

            if (/loaded|complete|undefined/.test(node.readyState)) {

                // Ensure only run once
                node.onload = node.onerror = node.onreadystatechange = null;

                // Reduce memory leak
                if (node.parentNode) {
                    try {
                        if (node.clearAttributes) {
                            node.clearAttributes();
                        }
                        else {
                            for (var p in node) delete node[p];
                        }
                    } catch (x) {
                    }

                    // Remove the script
                    head.removeChild(node);
                }

                // Dereference the node
                node = undefined;

                callback();
            }
        };

        // NOTICE:
        // Nothing will happen in Opera when the file status is 404. In this case,
        // the callback will be called when time is out.
    }

    function styleOnload(node, callback) {

        // for IE6-9 and Opera
        if (node.attachEvent) {
            node.attachEvent('onload', callback);
            // NOTICE:
            // 1. "onload" will be fired in IE6-9 when the file is 404, but in
            // this situation, Opera does nothing, so fallback to timeout.
            // 2. "onerror" doesn't fire in any browsers!
        }

        // Polling for Firefox, Chrome, Safari
        else {
            setTimeout(function() {
                poll(node, callback);
            }, 0); // Begin after node insertion
        }

    }

    function poll(node, callback) {
        if (callback.isCalled) {
            return;
        }

        var isLoaded;

        if (isWebKit) {
            if (node['sheet']) {
                isLoaded = true;
            }
        }
        // for Firefox
        else if (node['sheet']) {
            try {
                if (node['sheet'].cssRules) {
                    isLoaded = true;
                }
            } catch (ex) {
                // NS_ERROR_DOM_SECURITY_ERR
                if (ex.code === 1000) {
                    isLoaded = true;
                }
            }
        }

        setTimeout(function() {
            if (isLoaded) {
                // Place callback in here due to giving time for style rendering.
                callback();
            } else {
                poll(node, callback);
            }
        }, 1);
    }

// References:
//  - http://unixpapa.com/js/dyna.html
//  - ../test/research/load-js-css/test.html
//  - ../test/issues/load-css/test.html
//  - http://www.blaze.io/technical/ies-premature-execution-problem/
})(this, ent.util, ent.data);

// 基本的 define、seajs.use 逻辑
// 因为不需要考虑异步的情况，代码量相差很多
(function(global, util, data, undefined) {

    // ### mix
    var _mix = util.mix = function(toObj, fromObj, overwrite, whitelist){
        if (!toObj || !fromObj) {
            return toObj;
        }
        if (overwrite === undefined) {
            overwrite = true;
        }
        var i, p, len;
        if (whitelist && (len = whitelist.length)) {
            for (i = 0; i < len; i++) {
                p = whitelist[i];
                if (p in fromObj) {
                    if (overwrite || !(p in toObj)) {
                        toObj[p] = fromObj[p];
                    }
                }
            }
        }
        else {
            for (p in fromObj) {
                if (overwrite || !(p in toObj)) {
                    toObj[p] = fromObj[p];
                }
            }
        }
        return toObj;
    };

    // ### utilities package
    //
    //  - isFunction
    //  - isArray
    //  - isString
    //  - isPlainObject
    // 
    // 但这里的名字是缩短了的，只取了首字母
    _mix(util, (function() {
        var toString = Object.prototype.toString,
            AP = Array.prototype,
            exports;

        exports = {
            iF: function(o){
                return toString.call(o) === '[object Function]';
            },
            iA: function(o){
                return toString.call(o) === '[object Array]';
            },
            iS: function(o){
                return toString.call(o) === '[object String]';
            },
            iPO: function(o){
                return o && toString.call(o) === '[object Object]' && !o.nodeType && !o.setInterval;
            }
        };

        // 让代码可以放心直接调用 console.log
        // 不支持 console 或者没有 console.log 的，mokey patch 一下。
        // 只要代码不挂就可以了。
        if (!global.console) {
            global.console = {};
        }
        if (!console.log) {
            console.log = function() {};
        }
        // 直接用 console.log 最美，此处只为与 sea.js 本身的代码保持一致，方便抄袭
        //     exports.log = function() {
        //     };

        return exports;
    })());

    var _mods = ent.data.memoizedMods = {};

	// ### 记忆的模块的数据结构
	// 
	// dependencies 可能有模块会需要用到
    function Module(id, deps, factory) {
        this.id = id;
        this.dependencies = deps;
        this.factory = factory;
    }

    function _require(id) {
        var mod = _mods[id];

        if (!mod.exports) {
            _initExports(mod);
        }

        return mod.exports;
    }

	// 用例：
	//     define('mod_foo', function(require) {
	//         require.load('http://taobao.com/ajax.js?jsonp=aloha', function() {});
	//     });
    _require.load = function(uri, callback, charset) {
        util.getAsset(uri, callback, charset);
    };

	// ent.js 中不支持异步加载模块
	// 增加这个方法是为与创意中心里的代码逻辑保持一致，因为 `require.async`
	// 可以实现这种使用方式：
	//     define('cc/show', function(require) {
	//         var templet = 'cc/templets/p4p/rank';
	//
	//         require.async(templet, function(mod_templet) {
	//         });
	//     });
    _require.async = function(uris, callback) {
        _load(uris, callback);
    };

    function _load(ids, callback) {
        if (util.iS(ids)) {
            ids = [ids];
        }
		var args = [], i;

		for (i = 0; i < ids.length; i++) {
			args[i] = _require(ids[i]);
		}
		callback.apply(null, args);
    }

    function _initExports(mod, context) {
        var factory = mod.factory,
            ret;

        mod.exports = {};
        delete mod.factory;
		// 原代码中，`mod.ready` 用来标记模块的 js 是否加载完毕
		// 在穷人版 sea.js 里，就不再需要用了。
        //     delete mod.ready;
        
        if (util.iF(factory)) {
            ret = factory(_require, mod.exports, mod);
            if (ret !== undefined) {
                mod.exports = ret;
            }
        }
        else if (factory !== undefined) {
            mod.exports = factory;
        }
    }

    // 如果页面环境中已经有了 sea.js，则使用 sea.js 的版本，不重载方法。
    // ent.js 退回到工具包的角色，以 `require('ent')` 提供给大家使用
    if (!global.seajs) {
        // 正确 define 方式：`define(id, deps, factory)`
        // 与 sea.js 不同的是，不容许 id 不传，也不会根据地址猜测模块 id。
        // 这里可以因此省去很多代码。因为应对的是 js 压缩、合并之后的情况，足够使用。
        //
        // deps 倒是可以为空，等价于传入空数组，[]，因此这种形式的模块声明是合法的：
        //     define('hello', {world: 'earth'});
        global.define = function(id, deps, factory) {
            if (util.iF(deps) || util.iPO(deps)) {
                factory = deps;
                deps = [];
            }
            var mod = new Module(id, deps, factory);

            _mods[id] = mod;
        };
		// 为了方便使用，支持两种使用方式：
		//     seajs.use(['mod_a', 'mod_b'], function(modA, modB){});
		//     seajs.use('http://a.tbcdn.cn/bundled_modules.js', function(){});
        ent.use = function(ids, callback) {
			if (util.iS(ids) && ids.indexOf('http://') === 0) {
				util.getAsset(ids, callback);
			}
			else {
				_load(ids, callback);
			}
        };
        global.seajs = ent;
    }
})(this, ent.util, ent.data);

// KSLITE 在加载完毕之后，会存放一份实体到 kslite 名下。
// 创意中心里的老代码，以前都有习惯性的 require('kslite') 来用。
// 非常趁手，因此，我们这里也提供一份。
define('ent', function(require, exports) {
    ent.util.mix(exports, ent.util, true, 'mix iF iA iS iPO getAsset map'.split(' '));
});

// 异步加载与 onload 事件注册
// 应该有更好的方式吧？
//     (function(global, util, data, undefined){
//     	if (util.iA(global.entonload)) {
//     		var i;
//     
//     		for (i = 0; i < entonload.length; i++) {
//     			entonload[i]();	
//     		}
//     	}
//     	global.entonload = {
//     		push: function(fn) {
//     			fn();
//     		}
//     	};
//     })(this, ent.util, ent.data);

/* vim: softtabstop=4 tabstop=4 shiftwidth=4
 */

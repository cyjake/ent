/**
 * Static Module Loader v0.1.0
 * 
 * http://cyj.me/ent
 */
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

// 与 sea.js 的几个主要差别（不考虑做到一致，原因与 ent.js 的目标相同，这些都用不到）：
//
//  1. 没有 `seajs.config`，自然也没有 map、preload、alias 等
//  2. 不支持 plugin

;(function(global, ent, undefined) {

// ### 代码起始
//
// 初始化全局对象

// 已经定义了 _ent
if (ent && /cyj.me\/ent/.test(ent.about)) {
    return
}

ent = global._ent = {

    about: 'http://cyj.me/ent',

    util: {},

    config: {
        timeout: 30000,
        charset: 'utf-8'
    },

    cache: {},

    push: function(fn) {
        var queue = global._ent.data.queue;

        if (queue && queue.push) {
            queue.push(fn);
        }
        else {
            fn();
        }
    },

    // 缓存全局的 _ent 对象，在本 js 执行之时，它可能为 undefined，或者填有回调函数的数组。
    entWas: ent,

    defineWas: global.define
}

var util = ent.util

var config = ent.config

// ### utilities for fetching js and css files
//
//  1. util.fetch
//  2. util.getCurrentScript
//
// 等等。照搬自 sea.js
//
// 要实现资源文件的 onload 监听，比想象的要复杂得多，玉伯的代码非常棒。
// 我自然没道理再整一遍。

;(function() {
    var util = ent.util

    var doc = global.document

    // Not running in a browser. Won't provide util.fetch method.
    if (!doc) return

    var head = doc.head ||
            doc.getElementsByTagName('head')[0] ||
            doc.documentElement

    var baseElement = head.getElementsByTagName('base')[0]

    // 判断是否 CSS
    var IS_CSS_RE = /\.css(?:\?|$)/i
    var READY_STATE_RE = /loaded|complete|undefined/

    var currentlyAddingScript
    var interactiveScript


    util.fetch = function(url, callback, charset) {
        var isCSS = IS_CSS_RE.test(url)
        var node = document.createElement(isCSS ? 'link' : 'script')

        if (charset) {
            var cs = util.iF(charset) ? charset(url) : charset

            if (cs) node.charset = cs
        }

        assetOnload(node, callback || noop)

        if (isCSS) {
            node.rel = 'stylesheet'
            node.href = url
        }
        else {
            node.async = 'async'
            node.src = url
        }

        // For some cache cases in IE 6-9, the script executes IMMEDIATELY after
        // the end of the insertBefore execution, so use `currentlyAddingScript`
        // to hold current node, for deriving url in `define`.
        currentlyAddingScript = node

        // ref: #185 & http://dev.jquery.com/ticket/2709
        if (baseElement) {
            head.insertBefore(node, baseElement)
        }
        else {
            head.appendChild(node)
        }

        currentlyAddingScript = null
    }

    function assetOnload(node, callback) {
        if (node.nodeName === 'SCRIPT') {
            scriptOnload(node, callback)
        } else {
            styleOnload(node, callback)
        }
    }

    function scriptOnload(node, callback) {

        node.onload = node.onerror = node.onreadystatechange = function() {
            if (READY_STATE_RE.test(node.readyState)) {

                // Ensure only run once and handle memory leak in IE
                node.onload = node.onerror = node.onreadystatechange = null

                // Remove the script to reduce memory leak
                // if (node.parentNode && !config.debug) {
                //     head.removeChild(node)
                // }

                // Dereference the node
                node = undefined

                callback()
            }
        }

    }

    function styleOnload(node, callback) {

        // for Old WebKit and Old Firefox
        if (isOldWebKit || isOldFirefox) {
            util.log('Start poll to fetch css')

            setTimeout(function() {
                poll(node, callback)
            }, 1) // Begin after node insertion
        }
        else {
            node.onload = node.onerror = function() {
                node.onload = node.onerror = null
                node = undefined
                callback()
            }
        }

    }

    function poll(node, callback) {
        var isLoaded

        // for WebKit < 536
        if (isOldWebKit) {
            if (node.sheet) {
                isLoaded = true
            }
        }
        // for Firefox < 9.0
        else if (node.sheet) {
            try {
                if (node.sheet.cssRules) {
                    isLoaded = true
                }
            } catch (ex) {
                // The value of `ex.name` is changed from
                // 'NS_ERROR_DOM_SECURITY_ERR' to 'SecurityError' since Firefox 13.0
                // But Firefox is less than 9.0 in here, So it is ok to just rely on
                // 'NS_ERROR_DOM_SECURITY_ERR'
                if (ex.name === 'NS_ERROR_DOM_SECURITY_ERR') {
                    isLoaded = true
                }
            }
        }

        setTimeout(function() {
            if (isLoaded) {
                // Place callback in here due to giving time for style rendering.
                callback()
            } else {
                poll(node, callback)
            }
        }, 1)
    }

    function noop() {
    }


    util.getCurrentScript = function() {
        if (currentlyAddingScript) {
            return currentlyAddingScript
        }

        // For IE6-9 browsers, the script onload event may not fire right
        // after the the script is evaluated. Kris Zyp found that it
        // could query the script nodes and the one that is in "interactive"
        // mode indicates the current script.
        // Ref: http://goo.gl/JHfFW
        if (interactiveScript &&
                interactiveScript.readyState === 'interactive') {
            return interactiveScript
        }

        var scripts = head.getElementsByTagName('script')

        for (var i = 0; i < scripts.length; i++) {
            var script = scripts[i]
            if (script.readyState === 'interactive') {
                interactiveScript = script
                return script
            }
        }
    }

    util.getScriptAbsoluteSrc = function(node) {
        return node.hasAttribute ? // non-IE6/7
                node.src :
                // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
                node.getAttribute('src', 4)
    }


    util.importStyle = function(cssText, id) {
        // Don't add multi times
        if (id && doc.getElementById(id)) return

        var element = doc.createElement('style')

        if (id) element.id = id

        // Adds to DOM first to avoid the css hack invalid
        head.appendChild(element)

        // IE
        if (element.styleSheet) {
            element.styleSheet.cssText = cssText
        }
        // W3C
        else {
            element.appendChild(doc.createTextNode(cssText))
        }
    }

    util.scriptOnload = scriptOnload

    var UA = navigator.userAgent

    // `onload` event is supported in WebKit since 535.23
    // Ref:
    //    - https://bugs.webkit.org/show_activity.cgi?id=38995
    var isOldWebKit = Number(UA.replace(/.*AppleWebKit\/(\d+)\..*/, '$1')) < 536

    // `onload/onerror` event is supported since Firefox 9.0
    // Ref:
    //    - https://bugzilla.mozilla.org/show_bug.cgi?id=185236
    //    - https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
    var isOldFirefox = UA.indexOf('Firefox') > 0 &&
            !('onload' in document.createElement('link'))

})()
// References:
//    - http://unixpapa.com/js/dyna.html
//    - ../test/research/load-js-css/test.html
//    - ../test/issues/load-css/test.html
//    - http://www.blaze.io/technical/ies-premature-execution-problem/


// ### path related utilities

var DIRNAME_RE = /.*(?=\/.*$)/

// Extracts the directory portion of a path.
//
//     dirname('a/b/c.js') ==> 'a/b/'
//     dirname('d.js') ==> './'
//
// @see http://jsperf.com/regex-vs-split/2
function dirname(path) {
    var s = path.match(DIRNAME_RE)
    return (s ? s[0] : '.') + '/'
}

// 类似 node.js 里的 `path.resolve`
// context 为基本路径，id 则可能为相对路径
//
//     resolve('../foo', 'hello/world') ==> 'hello/foo'
//     resolve('../../bar', 'aloha/nihon/jinno/av/')
//         ==> 'aloha/nihon/bar'
//
function resolve(id, context) {
    var ret

    if (id.indexOf('./') === 0) {
        id = id.substr(2)
        context = dirname(context)
        ret = context + id
    }
    else if (id.indexOf('../') === 0) {
        id = id.substr(3)
        context = dirname(dirname(context).replace(/\/$/, ''))
        ret = context + id
    }
    if (id.charAt(0) === '.') {
        return resolve(id, context)
    }
    else {
        return ret || id
    }
}


// Normalizes pathname to start with '/'
//
// Ref: https://groups.google.com/forum/#!topic/seajs/9R29Inqk1UU
function normalizePathname(pathname) {
    if (pathname.charAt(0) !== '/') {
        pathname = '/' + pathname
    }
    return pathname
}

var loc = global.location

if (loc) {
    var pageUri = loc.protocol + '//' + loc.host +
        normalizePathname(loc.pathname)

    util.pageUri = pageUri
}
util.resolve = resolve


// ### define, seajs.use
//
// 实现基本的 define、seajs.use 逻辑。
// 因为不需要考虑异步的情况，代码量相差很多。


// ### mix
//
// 这个方法最早应该来自 kissy，`overwrite`、`whitelist` 等参数，
// 好像用的不多，暂且记着。另一种比较流行的使用场景是：
//
//     var result = mix({}, defaults, config)
//
// 可以很方便地拷贝 `defaults`，并将 `config` 覆盖上去。但本例不支持此场景。
var _mix = util.mix = function(toObj, fromObj, overwrite, whitelist){
    if (!toObj || !fromObj) {
        return toObj
    }
    if (overwrite === undefined) {
        overwrite = true
    }
    var i, p, len
    if (whitelist && (len = whitelist.length)) {
        for (i = 0; i < len; i++) {
            p = whitelist[i]
            if (p in fromObj) {
                if (overwrite || !(p in toObj)) {
                    toObj[p] = fromObj[p]
                }
            }
        }
    }
    else {
        for (p in fromObj) {
            if (overwrite || !(p in toObj)) {
                toObj[p] = fromObj[p]
            }
        }
    }
    return toObj
}

// ### utilities package
//
//  - isFunction
//  - isArray
//  - isString
//  - isPlainObject
//
// 但这里的名字是缩短了的，只取了首字母
_mix(util, (function() {
    var toString = Object.prototype.toString

    var exports = {
        iF: function(o){
            return toString.call(o) === '[object Function]'
        },
        iA: function(o){
            return toString.call(o) === '[object Array]'
        },
        iS: function(o){
            return toString.call(o) === '[object String]'
        },
        iPO: function(o){
            return o && toString.call(o) === '[object Object]' && !o.nodeType && !o.setInterval
        }
    }

    // 让代码可以放心直接调用 console.log
    // 不支持 console 或者没有 console.log 的，mokey patch 一下。
    // 只要代码不挂就可以了。
    if (!global.console) {
        global.console = {}
    }
    if (!console.log) {
        console.log = function() {}
    }

    return exports
})())

var _mods = ent.cache = {}

// ### 记忆的模块的数据结构
//
// dependencies 可能有模块会需要用到
function Module(id, deps, factory) {
    var module = this

    this.id = id
    this.dependencies = deps
    this.factory = factory
    this.require = require

    function require(path) {
        var id = util.resolve(path, module.id),
            mod = _mods[id]

        if (!mod) {
            console.log('_ent shouts: Module missing!', mod);
        }
        else if (!mod.exports) {
            mod._compile()
        }

        return mod.exports
    }
    // ent.js 中不支持异步加载模块
    // 增加这个方法是为与创意中心里的代码逻辑保持一致，因为 `require.async`
    // 可以实现这种使用方式：
    //
    //     define('cc/show', function(require) {
    //         var templet = 'cc/templets/p4p/rank'
    //
    //         require.async(templet, function(mod_templet) {
    //         })
    //     })
    //
    // 同时，`require.async` 还需要支持：
    //
    //     define('mod_foo', function(require) {
    //         require.async('http://taobao.com/ajax.js?jsonp=aloha', function() {})
    //     })
    //
    require.async = require.load = function(ids, callback) {
        module._use(ids, callback)
    }
}

util.mix(Module.prototype, {

    _use: function(ids, callback) {
        if (util.iS(ids) && ids.indexOf('http://') === 0) {
            util.fetch(ids, callback, config.charset)
        }
        else {
            var module = this

            if (util.iS(ids)) {
                ids = [ids]
            }
            var args = [], i

            for (i = 0; i < ids.length; i++) {
                args[i] = module.require(ids[i], module.id)
            }
            if (util.iF(callback)) {
                callback.apply(null, args)
            }
        }
    },

    _compile: function() {
        var mod = this,
            factory = mod.factory,
            ret

        mod.exports = {}
        ;delete mod.factory

        if (util.iF(factory)) {
            ret = factory(mod.require, mod.exports, mod)
            if (ret !== undefined) {
                mod.exports = ret
            }
        }
        else if (factory !== undefined) {
            mod.exports = factory
        }
    }
})

var gModule = new Module(util.pageUri)

// 如果页面环境中已经有了 sea.js，ent.js 退回到工具包的角色，以 `require('ent')`
// 提供给大家使用。

// 正确 define 方式：`define(id, deps, factory)`
// 与 sea.js 不同的是，不容许 id 不传，也不会根据地址猜测模块 id。
// 这里可以因此省去很多代码。因为应对的是 js 压缩、合并之后的情况，足够使用。
//
// deps 倒是可以为空，等价于传入空数组，[]，因此这种形式的模块声明是合法的：
//
//     define('hello', {world: 'earth'})
//
global.define = ent.define = function(id, deps, factory) {
    if (util.iF(deps) || util.iPO(deps)) {
        factory = deps
        deps = []
    }
    var mod = new Module(id, deps, factory)

    _mods[id] = mod
}
// 为了方便使用，支持两种使用方式：
//
//     seajs.use(['mod_a', 'mod_b'], function(modA, modB){})
//     seajs.use('http://a.tbcdn.cn/bundled_modules.js', function(){})
ent.use = function(ids, callback) {
    gModule._use(ids, callback)
}

// KSLITE 在加载完毕之后，会存放一份实体到 kslite 名下。
// 创意中心里的老代码，以前都有习惯性的 require('kslite') 来用。
// 非常趁手，因此，我们这里也提供一份。
function factory(require, exports) {

    // 大部分方法 util 里头已经有了
    util.mix(exports, util, true, 'mix iF iA iS iPO fetch'.split(' '))

    // 简易模板替换逻辑
    //
    //     .substitute("hello, {world}", {world: 'earth'}); // hello, earth
    //
    // 在 cc/datasource 中用到，可以用 cc/util/params 替换掉
    exports.substitute = function(str, o, regexp, multiSubstitute){
        if (!exports.iS(str) || !exports.iPO(o)) {
            return str
        }
        return str.replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name){
            if (match.charAt(0) === '\\') {
                return match.slice(1)
            }
            return (o[name] !== undefined) ? o[name] : (multiSubstitute ? match : "")
        })
    }
}

if (util.iF(ent.defineWas)) ent.defineWas.apply(global, ['ent', [], factory])

define('ent', [], factory)


// ### 异步加载
//
// 使用方式：
//
//     var _ent = _ent || []
//     _ent.push(function() {})
//
// 注意点：如果是使用异步方式引入，必须给引入 ent.js 的 script 节点标记
// `script._ent = true`。

// 如果运行时并不是浏览器，则不做 onload 之类的事情。
if (!global.document) {
    global.define = ent.defineWas
    return
}

var current = getCurrentScript()

// 如果找不到当前脚本，在如下情况下找不到当前脚本：
//
// - 被 Sea.js 等模块加载器异步加载
// - 代码被内联到 script 标签中
//
// 其余情况，在 getCurrentScript 辅助方法中处理。
if (!current) {
    global.define = ent.defineWas
    return
}

var originOnload = current.onload

// 得到当前节点的话，在当前脚本执行完毕之后再恢复全局的 define 。
util.scriptOnload(current, function() {

    global.define = ent.defineWas

    var queue = ent.entWas

    if (util.iA(queue)) {
        for (var i = 0; i < queue.length; i++) {
            var fn = queue[i]

            if (util.iF(fn)) fn()
        }
    }

    ent.push = function(fn) {
        fn()
    }

    if (util.iF(originOnload)) originOnload()
})

function getCurrentScript() {
    var doc = global.document
    var current = util.getCurrentScript()
    var len
    var scripts
    var i, s
    var tfsPtn = /tfscom\/T[^\/]+\.js$/

    // 如果使用 util.getCurrentScript 找不到当前节点，再试试其他方式
    // 找不到的原因可能是 ent 是被其他模块加载器加载的。
    if (!current) {
        scripts = doc.getElementsByTagName('script')
        len = scripts.length

        // 遍历所有 script 标签，如果：
        //
        // - _ent 属性设为 true，
        // - 有 ent 自定义属性，不为空
        //
        for (i = 0; i < len; i++) {
            s = scripts[i]
            if (s._ent || s.getAttribute('ent')) {
                current = s
                break
            }
        }
    }

    // 如果还是找不到，看看最后一个加载的 script 标签，静态加载时，最后一个 script 即当前
    // script 。拿到后，检查是否匹配 TFS CDN ，如果是，则认为是当前 JS 所在节点。
    //
    // s = scripts[len - 1]
    if (!current && tfsPtn.test(s.src)) current = s

    // 或者看看首个 script 标签，使用 KISSY.getScript 等方式异步加载时，会是首个节点。
    s = scripts[0]
    if (!current && tfsPtn.test(s.src)) current = s

    return current
}

})(this, this._ent);

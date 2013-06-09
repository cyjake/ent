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


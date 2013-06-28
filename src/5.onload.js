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

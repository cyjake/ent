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

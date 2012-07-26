// kslite 模块在创意中心的前端代码中广泛使用
// sea.js 自身并没有暴露这些代码，后来通过 seajs.pluginSDK 暴露了辅助方法；
// 所以就在其基础上自己包装一个，改叫 ent 吧
seajs.use('ent', function(ent) {
    module('ent utilities module');
    test('iF iPO iA', function() {
        ok(ent.iF(function(){}), 'iF works');
        ok(!ent.iF({}), 'iF works');

        // iPO 是 isPlainObject 的缩写
        ok(ent.iPO({}), 'iPO works');
        ok(!ent.iPO(function(){}), 'iPO works');

        ok(!ent.iA({}), 'iA works');
    });
});
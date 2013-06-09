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

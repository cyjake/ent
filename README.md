### Ent.js

Ent 是 **E**nt is **N**ot ksli**T**e 的缩写，糅合了玉伯 sea.js 
与李牧的 kslite.js 功能。

它的目的是，在应用 sea.js 做 js 模块加载器的项目中，对 js 文件尺寸比较敏感时，
可以用来替换掉 sea.js 本身，让打包文件小一点。

为了达到这个目的，去掉了许多 sea.js 中的功能，包括并且可能不限于：

 - seajs.config
 - require.async （ent.js 中有这个方法，但功能并非字面所示）

#### 使用场景

我自己的项目，创意中心，在用这个

#### 浏览器兼容性

 - Chrome
 - Firefox
 - IE6+

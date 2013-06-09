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


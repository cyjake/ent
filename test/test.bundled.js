var _ent = _ent || []

asyncTest('Loading bundled js dynamically', function() {
    (function(id, tname) {
        var doc = document
        var uid = "c" + id.replace(/[^-a-z0-9]/ig, "-") + "-" + (+new Date())

        _ent.push(function() {
            _ent.use("cc/show", function(cc) {
                cc.show(id, uid).on('render', function($c) {
                    equal(
                        parseInt(doc.getElementById('tbcc-c-' + uid).style.width, 10),
                        $c.info.width
                    )
                    start()
                })
            })
        })

        tbcc = doc.createElement('tbcc')
        tbcc.id = 'tbcc-c-' + uid
        tbcc.style.display = 'none'
        tbcc.appendChild(doc.createElement('tbcc'))

        doc.getElementsByTagName('body')[0].appendChild(tbcc)

        if (!_ent.use) {
            var h = doc.getElementsByTagName("head")[0]
            var s = doc.createElement("script")
            s.type = "text/javascript"
            s.async = s._ent = true
            s.src = "http:/strip.taobaocdn.com/tfscom/" + tname + ".js"
            h.insertBefore(s, h.firstChild)
        }

    })("2013_6/108893", "T193xcFopaXXXqupbX")
})
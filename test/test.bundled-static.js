asyncTest('loading bundled js statically', function() {
    var uid = 'bundled-static'
    var id = '2013_6/108893'

    _ent.use(['cc/show', 'cc/creations/' + id], function(cc, $c) {
        cc.show(id, uid).on('render', function() {
            equal(
                parseInt(document.getElementById('tbcc-c-' + uid).style.width, 10),
                $c.info.width
            )
            start()
        })
    })
})
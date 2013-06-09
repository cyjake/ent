define = _ent.define

var creations = [
	// bundled without ent
	['2012_3/3856', 'http://strip.taobaocdn.com/tfscom/T1QlGVXl8kXXXqupbX.js'],
	['2012_3/4017', 'http://strip.taobaocdn.com/tfscom/T1CReVXXBmXXXqupbX.js'],
	['2012_3/4019', 'http://strip.taobaocdn.com/tfscom/T1PBeVXX0mXXXqupbX.js']

	// should test cases when the creation has ent bundled in
]

window.onload = function() {
	var i, c

	for (i = 0; i < creations.length; i++) {
		c = creations[i]
		render(c[0], c[1])
	}
}

function render(id, url){
	var doc = document
	var body = doc.getElementsByTagName('body')[0]
	var uid = "c" + id.replace(/[^-a-z0-9]/gi, "-") + "-" + (+new Date())
	var tbcc = doc.createElement("tbcc")

	tbcc.appendChild(doc.createElement('tbcc'))
	tbcc.id = 'tbcc-c-' + uid
	tbcc.style.display = 'none'
	body.appendChild(tbcc)

	asyncTest('Showing bundled creation', function() {
		_ent.use(url, function() {
			_ent.use(['cc/show', 'cc/creations/' + id], function(cc, creation) {
				cc.show(id, uid)
				// The recent code has changed to creation.on('render')
				// The test cases should be updated accordingly.
				creation.afterRender = function() {
					equal(parseInt(tbcc.style.width, 10), creation.info.width)
					start()
				}
			})
		})
	})
}

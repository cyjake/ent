;(function() {
	var creations = [
		['2012_3/3856', 'http://strip.taobaocdn.com/tfscom/T1QlGVXl8kXXXqupbX.js'],
		['2012_3/4017', 'http://strip.taobaocdn.com/tfscom/T1CReVXXBmXXXqupbX.js'],
		['2012_3/4019', 'http://strip.taobaocdn.com/tfscom/T1PBeVXX0mXXXqupbX.js']
	]

	window.onload = function() {
		var i, c

		for (i = 0; i < creations.length; i++) {
			c = creations[i]
			render(c[0], c[1])
		}
	}

	function render(id, url){
		var doc = document,
			body = doc.getElementsByTagName('body')[0],
			tbcc,
			uid = "c" + id.replace(/[^-_a-zA-Z0-9]/g, "-") + "-" + (new Date()).getTime()

		tbcc = doc.createElement("tbcc")
		tbcc.appendChild(doc.createElement('tbcc'))
		tbcc.id = 'tbcc-c-' + uid
		tbcc.style.display = 'none'
		body.appendChild(tbcc)
		seajs.use(url, function() {
			seajs.use("cc/show", function(cc) {
				cc.show(id, uid)
			})
		})
	}
})()


describe('ent', function() {

  describe('ent.define', function() {
    it('define module with anonymous function', function(done) {
      _ent.define('a/bar', [], function(require, exports, module) {
        module.exports = 'Bar'
      })

      _ent.use('a/bar', function(bar) {
        expect(bar).to.equal('Bar')
        done()
      })
    })

    it('define mandatory data', function(done) {
      _ent.define('a/foo', 'Foo')

      _ent.use('a/foo', function(foo) {
        expect(foo).to.equal('Foo')
        done()
      })
    })

    it('resolves dependencies', function(done) {
      _ent.define('a/egg', ['./foo'], function(require, exports, module) {
        module.exports = 'Egg'
      })

      _ent.use('a/egg', function(egg) {
        expect(egg).to.equal('Egg')
        done()
      })
    })
  })

  describe('ent.require', function() {
    it('can require module via _ent directly', function() {
      expect(_ent.require('a/foo')).to.equal('Foo')
      expect(_ent.require('a/bar')).to.equal('Bar')

      _ent.define('a/ham', 'Ham')
      expect(_ent.require('a/ham')).to.equal('Ham')
    })
  })

  describe('ent.use', function() {
    it('should be asynchronous', function() {
      expect(_ent.use('a/foo')).to.equal(_ent)
    })
  })
})

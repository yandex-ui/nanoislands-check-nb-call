var expect = require('chai').expect;
var TYPE = require('../lib/errors').TYPE;

describe('nb-input-ignores', function() {

    it('should ignore nb-input "content" prop', function() {
        var name = this.compile('nb-input-ignores-content.yate');
        var res = this.check(name);

        expect(res.errors.isEmpty()).to.be.equal(true);
    });

    it('should ignore nb-input "content" prop in multiline', function() {
        var name = this.compile('nb-input-ignores-content-multiline.yate');
        var res = this.check(name);

        expect(res.errors.isEmpty()).to.be.equal(true);
    });

    it('should not ignore nb-input "leftContent" prop', function() {
        var name = this.compile('nb-input-not-ignores-leftContent.yate');
        var res = this.check(name);

        expect(res.errors.isEmpty()).to.be.equal(false);
    });

});

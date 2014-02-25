var expect = require('chai').expect;

describe('parse-errors', function() {

    it('should not return errors', function() {
        var name = this.compile('parse-errors.yate');
        var res = this.check(name);

        expect(res.errors.isEmpty()).to.be.equal(true);
    });

});

var expect = require('chai').expect;

describe('external-function', function() {

    it('should not return errors if function has xml type', function() {
        var name = this.compile('external-function.yate');
        var res = this.check(name);

        expect(res).to.have.length(0);
    });

    describe('function hasn\'t xml type', function() {

        before(function() {
            this.name = this.compile('external-function-noxml.yate');
            this.result = this.check(this.name);
        });

        it('should return error', function() {
            expect(this.result).to.have.length(1);
        });

        it('should return error with "error" key', function() {
            expect(this.result[0]).to.have.property('error', 'INVALID_TYPE');
        });

        it('should return error with "propName" key', function() {
            expect(this.result[0]).to.have.property('propName', 'content');
        });

        it('should return error with "propType" key', function() {
            expect(this.result[0]).to.have.property('propType', 'scalar');
        });

        it('should return error with "varName" key', function() {
            expect(this.result[0]).to.have.property('varName', 'func');
        });

        it('should return error with "where" key', function() {
            expect(this.result[0]).to.have.property('where').that.is.a('object');
        });

    });

});

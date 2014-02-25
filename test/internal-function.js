var expect = require('chai').expect;
var TYPE = require('../lib/errors').TYPE;

describe.only('internal-function', function() {

    it('should not return errors if function has xml type', function() {
        var name = this.compile('internal-function.yate');
        var res = this.check(name);

        expect(res.errors.isEmpty()).to.be.equal(true);
    });

    describe('function hasn\'t xml type', function() {

        before(function() {
            this.name = this.compile('internal-function-noxml.yate');
            this.result = this.check(this.name).errors;
        });

        it('should return error', function() {
            expect(this.result.getErrorCount()).to.be.equal(1);
        });

        it('should return error with "error" key', function() {
            expect(this.result.getErrorList()[0]).to.have.property('type', TYPE.INVALID_VAR_TYPE);
        });

        it('should return error with "propName" key', function() {
            expect(this.result.getErrorList()[0].error).to.have.property('propName', 'content');
        });

        it('should return error with "propType" key', function() {
            expect(this.result.getErrorList()[0].error).to.have.property('propType', 'scalar');
        });

        it('should return error with "varName" key', function() {
            expect(this.result.getErrorList()[0].error).to.have.property('varName', 'returnScalar');
        });

        it('should return error with "where" key', function() {
            expect(this.result.getErrorList()[0]).to.have.property('where').that.is.a('object');
        });

    });

});

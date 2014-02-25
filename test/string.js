var expect = require('chai').expect;
var TYPE = require('../lib/errors').TYPE;

describe('scalar', function() {

    it('should not return errors if content is valid string', function() {
        var name = this.compile('string-valid.yate');
        var res = this.check(name);

        expect(res.errors.isEmpty()).to.be.equal(true);
    });

    it('should not return errors if content is variable and variable is valid string', function() {
        var name = this.compile('string-valid-as-var.yate');
        var res = this.check(name);

        expect(res.errors.isEmpty()).to.be.equal(true);
    });

    describe('string with <>', function() {

        before(function() {
            this.name = this.compile('string-invalid.yate');
            this.result = this.check(this.name).errors;
        });

        it('should return error', function() {
            expect(this.result.getErrorCount()).to.be.equal(1);
        });

        it('should return error with "error" key', function() {
            expect(this.result.getErrorList()[0]).to.have.property('type', TYPE.STRING_HAS_TAGS);
        });

        it('should return error with "propName" key', function() {
            expect(this.result.getErrorList()[0].error).to.have.property('propName', 'content');
        });

        it('should return error with "propType" key', function() {
            expect(this.result.getErrorList()[0].error).to.have.property('propType', 'scalar');
        });

        it('should return error with "propValue" key', function() {
            expect(this.result.getErrorList()[0].error).to.have.property('propValue', '<text>');
        });

        it('should return error with "where" key', function() {
            expect(this.result.getErrorList()[0]).to.have.property('where').that.is.a('object');
        });

    });

    describe('string with <> as var', function() {

        before(function() {
            this.name = this.compile('string-invalid-as-var.yate');
            this.result = this.check(this.name).errors;
        });

        it('should return error', function() {
            expect(this.result.getErrorCount()).to.be.equal(1);
        });

        it('should return error with "error" key', function() {
            expect(this.result.getErrorList()[0]).to.have.property('type', TYPE.STRING_HAS_TAGS);
        });

        it('should return error with "propName" key', function() {
            expect(this.result.getErrorList()[0].error).to.have.property('propName', 'content');
        });

        it('should return error with "propType" key', function() {
            expect(this.result.getErrorList()[0].error).to.have.property('propType', 'scalar');
        });

        it('should return error with "propValue" key', function() {
            expect(this.result.getErrorList()[0].error).to.have.property('propValue', '<text>');
        });

        it('should return error with "where" key', function() {
            expect(this.result.getErrorList()[0]).to.have.property('where').that.is.a('object');
        });

    });

});

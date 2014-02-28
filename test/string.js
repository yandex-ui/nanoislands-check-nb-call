var expect = require('chai').expect;
var TYPE = require('../lib/errors').TYPE;

describe('scalar', function() {

    it('should not return errors if content is valid string', function() {
        var name = this.compile('string-valid.yate');
        var res = this.check(name);

        expect(res.errors.isEmpty()).to.be.equal(true);
    });

    it('should not return errors if content is empty string', function() {
        var name = this.compile('string-valid-empty.yate');
        var res = this.check(name);

        expect(res.errors.isEmpty()).to.be.equal(true);
    });

    it('should not return errors if content is variable and variable is valid string', function() {
        var name = this.compile('string-valid-as-var.yate');
        var res = this.check(name);

        expect(res.errors.isEmpty()).to.be.equal(true);
    });

    it('should not return errors if content is variable and variable has "xml type"', function() {
        var name = this.compile('string-valid-as-var2.yate');
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

    describe('scalar as calculated var', function() {

        before(function() {
            this.name = this.compile('string-invalid-as-var2.yate');
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

        it('should return error with "propValue" key', function() {
            expect(this.result.getErrorList()[0].error).to.have.property('varName', 'str-with-condition');
        });

        it('should return error with "where" key', function() {
            expect(this.result.getErrorList()[0]).to.have.property('where').that.is.a('object');
        });

    });

    describe('scalar with unknown value', function() {

        before(function() {
            this.name = this.compile('scalar-as-param.yate');
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

        it('should return error with "propValue" key', function() {
            expect(this.result.getErrorList()[0].error).to.have.property('varName', 'label-text');
        });

        it('should return error with "where" key', function() {
            expect(this.result.getErrorList()[0]).to.have.property('where').that.is.a('object');
        });

    });

});

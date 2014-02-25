var expect = require('chai').expect;
var TYPE = require('../lib/errors').TYPE;

describe('nodeset', function() {

    before(function() {
        this.name = this.compile('nodeset.yate');
        this.result = this.check(this.name).errors;
    });

    it('should throw error if content is nodeset', function() {
        expect(this.result.getErrorCount()).to.be.equal(1);
    });

    it('should return error with "error" key', function() {
        expect(this.result.getErrorList()[0]).to.have.property('type', TYPE.INVALID_TYPE);
    });

    it('should return error with "propName" key', function() {
        expect(this.result.getErrorList()[0].error).to.have.property('propName', 'content');
    });

    it('should return error with "propType" key', function() {
        expect(this.result.getErrorList()[0].error).to.have.property('propType', 'nodeset');
    });

    it('should return error with "where" key', function() {
        expect(this.result.getErrorList()[0]).to.have.property('where').that.is.a('object');
    });

});

describe('nodeset as var', function() {

    before(function() {
        var name = this.compile('nodeset-as-var.yate');
        this.result = this.check(name).errors;
    });

    it('should throw error if content is nodeset', function() {
        expect(this.result.getErrorCount()).to.be.equal(1);
    });

    it('should return error with "error" key', function() {
        expect(this.result.getErrorList()[0]).to.have.property('type', TYPE.INVALID_TYPE);
    });

    it('should return error with "propName" key', function() {
        expect(this.result.getErrorList()[0].error).to.have.property('propName', 'content');
    });

    it('should return error with "propType" key', function() {
        expect(this.result.getErrorList()[0].error).to.have.property('propType', 'nodeset');
    });

    it('should return error with "where" key', function() {
        expect(this.result.getErrorList()[0]).to.have.property('where').that.is.a('object');
    });

});

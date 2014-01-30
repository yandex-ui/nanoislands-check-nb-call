var expect = require('chai').expect;

describe('nodeset', function() {

    before(function() {
        this.name = this.compile('nodeset.yate');
        this.result = this.check(this.name);
    });

    it('should throw error if content is nodeset', function() {
        expect(this.result).to.have.length(1);
    });

    it('should return error with "error" key', function() {
        expect(this.result[0]).to.have.property('error', 'INVALID_TYPE');
    });

    it('should return error with "propName" key', function() {
        expect(this.result[0]).to.have.property('propName', 'content');
    });

    it('should return error with "propType" key', function() {
        expect(this.result[0]).to.have.property('propType', 'nodeset');
    });

    it('should return error with "where" key', function() {
        expect(this.result[0]).to.have.property('where').that.is.a('object');
    });

});

describe('nodeset as var', function() {

    before(function() {
        var name = this.compile('nodeset-as-var.yate');
        this.result = this.check(name);
    });

    it('should throw error if content is nodeset', function() {
        expect(this.result).to.have.length(1);
    });

    it('should return error with "error" key', function() {
        expect(this.result[0]).to.have.property('error', 'INVALID_TYPE');
    });

    it('should return error with "propName" key', function() {
        expect(this.result[0]).to.have.property('propName', 'content');
    });

    it('should return error with "propType" key', function() {
        expect(this.result[0]).to.have.property('propType', 'nodeset');
    });

    it('should return error with "where" key', function() {
        expect(this.result[0]).to.have.property('where').that.is.a('object');
    });

});

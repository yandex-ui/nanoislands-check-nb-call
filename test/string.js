var expect = require('chai').expect;

describe('scalar', function() {

    it('should not return errors if content is valid string', function() {
        var name = this.compile('string-valid.yate');
        var res = this.check(name);

        expect(res).to.have.length(0);
    });

    describe('string with <>', function() {

        before(function() {
            this.name = this.compile('string-invalid.yate');
            this.result = this.check(this.name);
        });

        it('should throw error if content is nodeset', function() {
            expect(this.result).to.have.length(1);
        });

        it('should return error with "error" key', function() {
            expect(this.result[0]).to.have.property('error', 'STRING_HAS_TAGS');
        });

        it('should return error with "propName" key', function() {
            expect(this.result[0]).to.have.property('propName', 'content');
        });

        it('should return error with "propType" key', function() {
            expect(this.result[0]).to.have.property('propType', 'scalar');
        });

        it('should return error with "propValue" key', function() {
            expect(this.result[0]).to.have.property('propValue', '<text>');
        });

        it('should return error with "where" key', function() {
            expect(this.result[0]).to.have.property('where').that.is.a('object');
        });

    });

});

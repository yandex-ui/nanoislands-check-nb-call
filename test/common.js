before(function() {

    this.compile = function(filename) {
        var FS = require('fs');

        var name = __dirname + '/_' + filename;

        FS.writeFileSync(
            name,
            'include "../node_modules/nanoislands/nanoislands.yate"\ninclude "' + filename + '"\n',
            'utf-8'
        );

        return name;
    };

    this.check = require('../checker.js').check;

});

afterEach(function(cb) {
    require('child_process').exec('rm -rf ' + __dirname + '/_*.yate', function() {
        cb();
    });
});

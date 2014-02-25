#!/usr/bin/env node

require('coa').Cmd()
    .name(process.argv[1])
    .title('Dummy checks to prevent XSS in nanoislands yate templates.')
    .helpful()
    .opt()
        .name('version') .title('Version')
        .short('v').long('version')
        .flag()
        .only()
        .act(function() {
            return require('../package.json').version;
        })
        .end()
    .opt()
        .name('input').title('Input path')
        .short('i').long('input')
        .req()
        .end()
    .opt()
        .name('ast').title('Write ast for compiled yate-file (default: yes)')
        .long('freeze')
        .def(true)
        .val(function(v) {
            return stringToBoolean(v, true);
        })
        .end()
    .opt()
        .name('import').title('Import path for yate modules')
        .long('import')
        .end()
    .act(function(opts) {
        var checker = require('../checker');

        var result = checker.check(
            opts['input'],
            opts['import'],
            opts
        );
        result.errors.explainErrors();
    })
    .run();

function stringToBoolean(s, def) {
    if (typeof s === 'boolean') {
        return s;
    }
    if (s == 'yes' || s == 'true') {
        return true;
    }
    if (s == 'no' || s == 'false') {
        return false;
    }
    return !!def;
}

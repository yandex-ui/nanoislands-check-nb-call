#!/usr/bin/env node

var checker = require('../checker');

var result = checker.check(process.argv[2]);
result.errors.explainErrors();

#!/usr/bin/env node

var checker = require('../checker');

var errors = checker.check(process.argv[2]);
errors.explainErrors();

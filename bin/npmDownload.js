#!/usr/bin/env node
"use strict";
let program = require('commander'),
    packages = require('../coercions/packagesCoercion'),
    app = require("../index.js"),
    winston = require('winston'),
    winstonConfigurator = require('../winstonConfiguration');

//noinspection JSCheckFunctionSignatures
program
    .version('0.1.3')
    .option('-p, --packages [packages]', 'A list of space separated [packages].', packages)
    .option('-d, --dependencies', 'Download dependencies.')
    .option('-e, --devDependencies', 'Download dev dependencies.')
    .option('-a, --allVersions', 'Download all versions of each package.')
    .option('-o, --output [directory]', 'The output [directory].')
    .option('-7, --zipIt', '7Zips the downloaded files.')
    .parse(process.argv);

if (!program.packages) {
    winston.error("No npmPackage were given!");
    process.exit();
}

if (!program.output) {
    winston.error("No output directory were given!");
    process.exit();
}

winstonConfigurator(program.outout);
winston.info("Welcome to npm package downloader.");
app(program.packages, program);
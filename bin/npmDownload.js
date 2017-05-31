#!/usr/bin/env node
"use strict";
let program = require('commander'),
    packages = require('../coercions/packagesCoercion'),
    packagesFromJsonFile = require('../coercions/packagesFromJsonFileCoercion'),
    app = require("../index.js"),
    winston = require('winston'),
    winstonConfigurator = require('../winstonConfiguration');

//noinspection JSCheckFunctionSignatures
program
    .version('0.1.4')
    .option('-p, --packages [packages]', 'A list of space separated [packages].', packages)
    .option('-j, --packagesFromJsonFile [jsonFilePath]', 'path to package.json file.', packagesFromJsonFile)
    .option('-d, --dependencies', 'Download dependencies.')
    .option('-e, --devDependencies', 'Download dev dependencies.')
    .option('-a, --allVersions', 'Download all versions of each package.')
    .option('-o, --output [directory]', 'The output [directory].')
    .option('-7, --zipIt', '7Zips the downloaded files.')
    .parse(process.argv);

if (!program.packages && !program.packagesFromJsonFile) {
    winston.error("No npmPackage of path to jsonFile were given!");
    process.exit();
}

if (!program.output) {
    winston.error("No output directory were given!");
    process.exit();
}

winstonConfigurator(program.output);
winston.info("Welcome to npm package downloader.");

if (program.packagesFromJsonFile) {
    program.packages = program.packagesFromJsonFile;
}

app(program.packages, program);
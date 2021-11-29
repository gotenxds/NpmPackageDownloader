#!/usr/bin/env node
"use strict";
import program from "commander";
import packages from "../coercions/packagesCoercion.js";
import packagesFromJsonFile from "../coercions/packagesFromJsonFileCoercion.js";
import app from "../index.js";
import winston from "winston";
import winstonConfigurator from "../winstonConfiguration.js";

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
    winston.error("No npmPackage or path to jsonFile were given!");
    process.exit();
}

if (!program.output) {
    winston.error("No output directory were given!");
    process.exit();
}

let npmPackages;

if (program.packages && program.packagesFromJsonFile) {
    npmPackages = program.packages.concat(program.packagesFromJsonFile);
} else {
    npmPackages = program.packagesFromJsonFile ? program.packagesFromJsonFile : program.packages;
}

winstonConfigurator(program.output);
winston.info("Welcome to npm package downloader.");
app(npmPackages, program);
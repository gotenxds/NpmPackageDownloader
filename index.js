"use strict";
var winston = require('winston'),
    program = require('commander'),
    _ = require('lodash'),
    npm = require('./npmLoader.js'),
    Promise = require('bluebird'),
    semver = require('semver');

program
    .version('0.0.1')
    .option('-p, --packages [packages]', 'A list of space seperated [packages]')
    .option('-d, --dependencies', 'Download dependencies')
    .option('-e, --devDependencies', 'Download dev dependencies')
    .option('-a, --allVersions', 'Download all versions of each package')
    .option('-o, --output [directory]', 'The output [directory]')
    .parse(process.argv);

winston.info("Welcome to npm package downloader.");

if (!program.packages) {
    winston.error("No npmPackage where given!");
    process.exit();
}

if (!program.output) {
    winston.error("No output directory was given!");
    process.exit();
}

winston.info("Downloading -> " + program.packages);

let npmPackages = [];
let packagesIterator = npmPackages[Symbol.iterator]();

program.packages.split(' ').forEach(name => {
    npmPackages.push({name: name, downloaded: false, versions: new Set()});
});

function nextPackage() {
    let nextPackage = packagesIterator.next().value;

    if (nextPackage) {
        downloadPackage(nextPackage.name);
    } else {
        winston.info("Finished downloading.");
        winston.info("GoodBye.");
        process.exit();
    }
}

function downloadPackage(name) {
        addVersionsFor(name)
            .then(() => downloadTarBall(name))
            .then(() => addDependencies(name))
            .then(() => addDevDependencies(name))
            .then(nextPackage)
}

function addVersionsFor(name) {
    if (program.allVersions) {
        winston.info(`Adding all versions of ${name}`);
        return addAllVersions(name);
    } else {
        let npmPackage = _.find(npmPackages, {name: name});

        return npm.getLatestVersionOf(name)
                .then(version => npmPackage.versions.add(version));
    }
}

function addDependencies(name) {
    if (program.dependencies) {
        winston.info(`Adding dependencies for ${name}`);

        return npm.getDependenciesOf(name)
            .then((dependencies) => {
                let promises = [];
                _.forOwn(dependencies, (v, p) => promises.push(addLatestSatisfyingVersionOf(p, v)));

                return Promise.all(promises)
            });
    }

    return Promise.resolve();
}

function addDevDependencies(name) {
    if (program.devDependencies) {
        winston.info(`Adding dev dependencies for ${name}`);

        return npm.getDevDependenciesOf(name)
            .then((dependencies) => {
                let promises = [];
                _.forOwn(dependencies, (v, p) => promises.push(addLatestSatisfyingVersionOf(p, v)));

                return Promise.all(promises)
            });
    }

    return Promise.resolve();
}

function addLatestSatisfyingVersionOf(packageName, ver) {
    return npm.getVersionsOf(packageName)
        .spread((name, versions) => {
            let npmPackage = _.find(npmPackages, {name: packageName});
            let latestSatisfyingVersion = semver.maxSatisfying(versions, ver);

            if (!npmPackage) {
                addNewPackage(packageName, latestSatisfyingVersion);
            } else {
                if (!packageContainsSatisfyingVersion(npmPackage, ver)) {
                    npmPackage.versions.add(latestSatisfyingVersion);

                    if (npmPackage.downloaded) {
                        npm.downloadTarBallOf(npmPackage.name, [latestSatisfyingVersion])
                    }
                }
            }
        })
}

function packageContainsSatisfyingVersion(npmPackage, ver) {
    return semver.maxSatisfying(Array.from(npmPackage.versions), ver);
}

function addNewPackage(npmPackage, latestSatisfyingVersion) {
    npmPackages.push({name: npmPackage, versions: new Set([latestSatisfyingVersion]), downloaded: false});
}

function addAllVersions(name) {
    return new Promise(function (resolve) {
        npm.getVersionsOf(name)
            .spread((name, versions) => {
                let npmPackage = _.find(npmPackages, {name: name});

                npmPackage.versions = _.union(npmPackage.versions, versions);

                resolve();
            });
    })
}

function downloadTarBall(name) {
    let npmPackage = _.find(npmPackages, {name: name});

    return npm.downloadTarBallOf(name, npmPackage.versions)
        .catch((e) => {
            winston.error(`${e.message} \n Was unable to download ${e.path}`);
        })
        .finally(() => {
            winston.info(`Finished downloading ${name}.`);
            npmPackage.downloaded = true;
        });
}

nextPackage();
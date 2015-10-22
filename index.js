"use strict";
let winston = require('winston'),
    program = require('commander'),
    _ = require('lodash'),
    npm = require('./npmLoader.js'),
    Promise = require('bluebird'),
    semver = require('semver'),
    Zip = require('node-7z'),
    validUrl = require('valid-url');

program
    .version('0.0.1')
    .option('-p, --packages [packages]', 'A list of space seperated [packages].')
    .option('-d, --dependencies', 'Download dependencies.')
    .option('-e, --devDependencies', 'Download dev dependencies.')
    .option('-a, --allVersions', 'Download all versions of each package.')
    .option('-o, --output [directory]', 'The output [directory].')
    .option('-7, --zipIt', '7Zips the downloaded files.')
    .parse(process.argv);

winston.info("Welcome to npm package downloader.");

if (!program.packages) {
    winston.error("No npmPackage were given!");
    process.exit();
}

if (!program.output) {
    winston.error("No output directory were given!");
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

        if (program.zipIt) {
            winston.info('7Ziping your files, Please wait...');

            let zip = new Zip();

            zip.add(program.output + '\\npm-personalNumber.7z', program.output)
                .then(() => winston.info(`Finished ziping!\n7Zip is wating for you in ${program.output}`))
                .then(close);
        } else {
            close()
        }
    }
}

function close() {
    winston.info("GoodBye.");
    process.exit();
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
            let latestSatisfyingVersion = getLatestSatisfyingVersion(versions, ver);

            if (!npmPackage) {
                addNewPackage(packageName, latestSatisfyingVersion);
            } else {
                if (!packageContainsSatisfyingVersion(npmPackage, ver)) {
                    npmPackage.versions.add(latestSatisfyingVersion);

                    if (npmPackage.downloaded) {
                        npm.downloadTarBallOf(npmPackage.name, [latestSatisfyingVersion], program.output)
                    }
                }
            }
        })
}
function getLatestSatisfyingVersion(versions, ver) {
    if (validUrl.isUri(ver)){
        if (ver.startsWith("git:")){
            return ver.replace("git:", "https:").replace(".git", "/archive/master.zip");
        }
        return ver;
    }

    return semver.maxSatisfying(versions, parseVersion(ver));
}

function parseVersion(ver) {
    return ver == 'latest' ? ">0.0.0" : ver;
}

function addNewPackage(npmPackage, latestSatisfyingVersion) {
    npmPackages.push({name: npmPackage, versions: new Set([latestSatisfyingVersion]), downloaded: false});
}

function packageContainsSatisfyingVersion(npmPackage, ver) {
    return semver.maxSatisfying(Array.from(npmPackage.versions).filter(semver.valid), ver);
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

    return npm.downloadTarBallOf(name, npmPackage.versions, program.output)
        .catch((e) => {
            winston.error(`${e.message} \n Was unable to download ${e.path}`);
        })
        .finally(() => {
            winston.info(`Finished downloading ${name}.`);
            npmPackage.downloaded = true;
        });
}

nextPackage();
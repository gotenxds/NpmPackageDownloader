"use strict";
let winston = require('winston'),
    zip = require('./7Zipper'),
    _ = require('lodash'),
    npm = require('./npmApi.js'),
    Promise = require('bluebird'),
    versionUtils = require('./versionUtils');

module.exports = function (npmPackages, opts) {

    winston.info("Downloading -> " + npmPackages.map(p => p.name));

    let packagesIterator = npmPackages[Symbol.iterator]();

    function nextPackage() {
        let nextPackage = packagesIterator.next().value;

        if (nextPackage) {
            downloadPackage(nextPackage.name);
        } else {
            winston.info("Finished downloading.");

            if (opts.zipIt) {
                zip(opts.output).then(close);
            } else {
                close()
            }
        }
    }

    function downloadPackage(name) {
        addVersionsFor(name)
            .then(() => downloadTarBall(name))
            .then(() => addDependencies(name))
            .then(() => addDevDependencies(name))
            .then(nextPackage)
    }

    function close() {
        winston.info("GoodBye.");
        process.exit();
    }

    function addVersionsFor(name) {
        if (opts.allVersions) {
            winston.info(`Adding all versions of ${name}`);
            return addAllVersions(name);
        } else {
            let npmPackage = _.find(npmPackages, {name: name});

            return npm.getLatestVersionOf(name)
                .then(version => npmPackage.versions.add(version));
        }
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

    function addDependencies(name) {
        if (opts.dependencies) {
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
        if (opts.devDependencies) {
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
                let latestSatisfyingVersion = versionUtils.getLatestSatisfyingVersion(versions, ver);

                if (!npmPackage) {
                    addNewPackage(packageName, latestSatisfyingVersion);
                } else {
                    if (!versionUtils.packageContainsSatisfyingVersion(npmPackage, ver)) {
                        npmPackage.versions.add(latestSatisfyingVersion);

                        if (npmPackage.downloaded) {
                            npm.downloadTarBallOf(npmPackage.name, [latestSatisfyingVersion], opts.output)
                        }
                    }
                }
            })
    }

    function addNewPackage(npmPackage, latestSatisfyingVersion) {
        npmPackages.push({name: npmPackage, versions: new Set([latestSatisfyingVersion]), downloaded: false});
    }

    function downloadTarBall(name) {
        let npmPackage = _.find(npmPackages, {name: name});

        return npm.downloadTarBallOf(name, npmPackage.versions, opts.output)
            .catch((e) => {
                winston.error(`${e.message} \n Was unable to download ${name}`);
            })
            .finally(() => {
                winston.info(`Finished downloading ${name}.`);
                npmPackage.downloaded = true;
            });
    }

    nextPackage();
};
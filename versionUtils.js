"use strict";
let isUri = require('valid-url').isUri,
    semver = require('semver');

module.exports = {
    getLatestSatisfyingVersion (versions, ver) {
        if (isUri(ver)) {
            return parseUri(ver);
        }

        return semver.maxSatisfying(versions, parseVersion(ver));
    },

    packageContainsSatisfyingVersion (npmPackage, ver) {
        return semver.maxSatisfying(Array.from(npmPackage.versions).filter(semver.valid), ver);
    }
};

function parseUri(uri){
    if (uri.startsWith("git:")) {
        return uri.replace("git:", "https:").replace(".git", "/archive/master.zip");
    }

    return uri;
}

function parseVersion(ver) {
    return ver == 'latest' ? ">0.0.0" : ver;
}
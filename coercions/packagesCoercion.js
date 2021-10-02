'use strict';
import nameUtils from "../nameUtils.js";

export default function (packages) {
    return packages.split(" ").map(npmPackage => {

        npmPackage = splitToNameAndVersion(npmPackage);

        return {
            name: nameUtils.parse(npmPackage[0]),
            downloaded: false,
            versions: npmPackage[1] ? new Set([npmPackage[1]]) : new Set()
        };
    });
};

function splitToNameAndVersion(npmPackage) {
    let splitIndex = npmPackage.lastIndexOf('@');

    if (splitIndex <= 0) {
        return [npmPackage];
    }

    return [npmPackage.substring(0, splitIndex), npmPackage.substring(splitIndex + 1)];
}

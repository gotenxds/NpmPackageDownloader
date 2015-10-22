module.exports = function(packages){
    return packages.split(" ").map(npmPackage => {
        npmPackage = npmPackage.split('@');
        return {name: npmPackage[0], downloaded: false, versions: npmPackage[1] ? new Set([npmPackage[1]]) : new Set()};
    });
};
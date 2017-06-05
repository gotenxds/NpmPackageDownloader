'use strict';
let fs = require('fs'),
    packages = require('./packagesCoercion');

module.exports = (jsonFilePath) => {
    const fileContent = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
    const dependencies = attachNameAndVersion(fileContent.dependencies);
    const devDependencies = attachNameAndVersion(fileContent.devDependencies);

    return packages(`${dependencies} ${devDependencies}`);
};

function attachNameAndVersion(jsonObject) {
    let orderedDependencies = '';

    for (const dependency in jsonObject) {
        let version = jsonObject[dependency];

        if (version[0] !== '@') {
            version = `@${version}`;
        }

        orderedDependencies += `${dependency}${version} `;
    }

    return orderedDependencies.trimRight();
}

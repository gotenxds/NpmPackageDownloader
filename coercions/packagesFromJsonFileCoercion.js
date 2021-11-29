'use strict';
import fs from "fs";
import packages from "./packagesCoercion.js";

export default  (jsonFilePath) => {
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

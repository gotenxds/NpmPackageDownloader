"use strict";
import winston from "winston";
import Zip from "node-7z";
import path from "path";

export default function (location) {
    winston.info('7Ziping your files, Please wait...');

    let zip = new Zip();

    return zip.add(location + path.sep + 'npm-personalNumber.7z', location)
            .then(() => winston.info(`Finished ziping!\n7Zip is wating for you in ${location}`))
};

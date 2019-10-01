"use strict";
let winston = require('winston'),
    Zip = require('node-7z');
const path = require('path');

module.exports = function (location) {
    winston.info('7Ziping your files, Please wait...');

    let zip = new Zip();

    return zip.add(location + path.sep + 'npm-personalNumber.7z', location)
            .then(() => winston.info(`Finished ziping!\n7Zip is wating for you in ${location}`))
};

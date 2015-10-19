var winston = require('winston'),
    program = require('commander');

program
    .version('0.0.1')
    .option('-d', '--download [packages]', 'A list of space seperated [packages]')
    .option('-dep', '--dependencies', 'Download dependencies')
    .option('-devdep', '--dev-dependencies', 'Download dev dependencies')
    .option('-av', '--all-versions', 'Download all versions of each package')
    .parse(process.argv);


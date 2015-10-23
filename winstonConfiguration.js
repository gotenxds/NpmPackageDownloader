let winston = require('winston');

winston.add(winston.transports.File, {
    level:'Error',
    filename:`${program.output}\errorLog.log`
});

winston.cli();
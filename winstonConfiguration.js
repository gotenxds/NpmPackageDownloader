"use strict";
import winston from "winston";

export default  function(output){
    winston.add(winston.transports.File, {
        level:'error',
        filename:`${output}\errorLog.log`
    });

    winston.cli();
};
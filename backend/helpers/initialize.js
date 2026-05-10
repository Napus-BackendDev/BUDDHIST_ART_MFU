'use strict';

const mongoose = require('mongoose');
const cfg = require('../config/config');
const resMsg = require('../config/message');

exports.init = function (callback) {
    mongoose.Promise = global.Promise;

    const options = { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    };

    mongoose.connect(cfg.mongoURI, options);
    
    const db = mongoose.connection;
    
    db.on('error', (err) => {
        console.log(`----- Connect To MongoDB Error Status[${JSON.stringify(err)}] -----`);
        return callback(true);
    });

    db.once('open', () => {
        // we're connected!
        global.mongodb = db;
        console.log(`----- Connect To Mongodb Status[${JSON.stringify(resMsg.getMsg(20000))}] -----`);
        return callback(true);
    });

    db.on('connected', () => {
        console.info("MongoDB connection is established.");
    });
};

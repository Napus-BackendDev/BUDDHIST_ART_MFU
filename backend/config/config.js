/**
 * Created by sherlock on 01/02/2017.
 */

var os = require("os");
require('dotenv').config();

module.exports = {
    debug: true,
    key:process.env.KEY,
    mongoURI: process.env.MONGODB,
    jwtSecret: process.env.JWT_SECRET,
    timeout: process.env.TIMEOUT,
    tokenLength: process.env.TOKENLANGTH,
    tokenExpired: (86400000 * process.env.TOKENEXPIRED),
    transactionExpired: (60000 *process.env.TRANSACTIONEXPIRED),
    host: {
        name: os.hostname(),
        url:process.env.BASE_SERVER_URL,
        port: process.env.PORT
    },

    images_part : {
        profile : "profile/",
        ranks : "ranks/"
    }



};

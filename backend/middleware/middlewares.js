const express = require('express');
const bodyParser = require("body-parser");
const nocache = require("nocache");
const nosniff = require("dont-sniff-mimetype");
const xssFilter = require("x-xss-protection");
const ienoopen = require("ienoopen");
const compression = require("compression");
const morgan = require("morgan");
const sass = require("sass-middleware");
const expressValidator = require('express-validator');
const path = require("path");
const cors = require('cors');

const { corsOptions, ipCheckMiddleware } = require('../config/corsAndIP');
const { createApiLimiter } = require('../config/rateLimit');

// Import logger
const loggerMiddleware = require('../config/logger');

module.exports = function (app) {

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ limit: '10mb', extended: true }));

    app.use(compression());
    const protectionEnabled = process.env.DISABLE_IP_BLOCKING === 'false' ||
        (process.env.NODE_ENV === 'production' && process.env.DISABLE_IP_BLOCKING !== 'true');
    if (protectionEnabled) {
        app.use('/api/v1', ipCheckMiddleware, createApiLimiter());
    }
    if (process.env.NODE_ENV === 'production') {
        app.use(morgan('combined')); // ใช้ log format ที่เหมาะสม
    } else {
        app.use(morgan('dev')); // ใช้ log format สำหรับ development
    }

    app.use(expressValidator());
    app.disable("x-powered-by");
    app.use(ienoopen());
    app.use(nocache());
    app.use(nosniff());
    app.use(xssFilter());

    // Order PDFs contain private buyer details. Serve them only through the
    // authenticated, owner-checked order endpoints, never the static aliases.
    app.use((req, res, next) => {
        let pathname;
        try {
            pathname = path.posix.normalize(decodeURIComponent(req.path).replace(/\\/g, '/'));
        } catch (error) {
            return res.sendStatus(400);
        }
        if (/^\/(?:uploads\/)?account\/User\/[^/]+\/(?:Invoice|Certificate)(?:\/|$)/i.test(pathname)) {
            return res.sendStatus(404);
        }
        return next();
    });

    app.use(sass({ src: "./sass", dest: "./public/css", debug: true, outputStyle: "compressed" }));
    app.use(express.static(path.join(__dirname, "../public")));
    app.use(express.static(path.join(__dirname, "../node_modules/bootstrap/dist")));

    // Serve uploads folder by aliasing it to the root public folder
    app.use('/uploads', express.static(path.join(__dirname, "../public")));

    // การใช้งาน logger ใน Express
    // app.use(loggerMiddleware);

    // Handle errors
    app.use((err, req, res, next) => {
        console.error(err);
        res.status(500).send({ message: "Internal Server Error" });
    });
};

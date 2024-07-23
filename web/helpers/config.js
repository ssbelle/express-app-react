'use strict';

const dotenv = require('dotenv');
dotenv.config();

const API_DOMAIN = (process.env.API_DOMAIN || "vcai.forthestudio.dev");

module.exports = {
    API_DOMAIN
};
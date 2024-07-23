'use strict';

const axios = require('axios');
const express = require('express');
const { API_DOMAIN } = require('../helpers/config');
const auth = require("./tokenvalidation")

let spaceRouter = express.Router();

spaceRouter.get('/', auth.isAuthorized, async (req, res, next) => {
    var options = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/AI/user`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };
    try {
        var response = await axios.request(options);
        res.render('space.html', { page: 'space', user: req.user, data: response.data, title: 'Space' });
    } catch (error) {
        res.json({ error: error });
    }
});

module.exports = spaceRouter;
'use strict';

const axios = require('axios');
const express = require('express');
const { API_DOMAIN } = require('../helpers/config');
const auth = require("./tokenvalidation")

let chatboxRouter = express.Router();

chatboxRouter.get('/', auth.isAuthorized, async (req, res, next) => {
    res.render('chatbox.html', { page: 'Talk to your files', user: req.user, data: [], title: 'Google drive Chatbox' });
});

module.exports = chatboxRouter;
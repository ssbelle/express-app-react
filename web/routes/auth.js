'use strict';

const axios = require('axios');
const express = require('express');
const { API_DOMAIN } = require('../helpers/config');

let authRouter = express.Router();

authRouter.post('/user', async (req, res, next) => {
    const requestData = req.body;
    var options = {
        method: "POST",
        url: `https://${API_DOMAIN}/api/Account/authenticate`,
        headers: {
            "content-type": "application/json"
        },
        data: {
            email: requestData.email
        }
    };
    try {
        await axios.request(options);
        res.cookie('_vcaiemail', requestData.email, { HttpOnly: true, expire: 24 * 60 * 60 * 1000 });
        res.redirect(`/verify`);
    } catch (error) {
        res.redirect('/');
    }
});

authRouter.post('/verify', async (req, res, next) => {
    const requestData = req.body;
    var otpCode = `${requestData.code_1}${requestData.code_2}${requestData.code_3}${requestData.code_4}${requestData.code_5}${requestData.code_6}`;
    var requestObj = {
        email: req.cookies._vcaiemail,
        otpCode: otpCode
    };
    var options = {
        method: "POST",
        url: `https://${API_DOMAIN}/api/Account/validateotp`,
        headers: {
            "content-type": "application/json"
        },
        data: requestObj
    };
    try {
        console.log(requestObj);
        var response = await axios.request(options);
        res.cookie('_vcaitoken', response.data.token, { HttpOnly: true, expire: 30 * 24 * 60 * 60 * 1000 });
        res.redirect(`/search`);
    } catch (error) {
        res.redirect('/');
    }
});

authRouter.get('/signout', async (req, res, next) => {
    await res.clearCookie('_vcaitoken');
    return res.redirect("/");
});

module.exports = authRouter;
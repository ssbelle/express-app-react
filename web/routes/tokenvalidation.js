'use strict';

const axios = require('axios');
const { API_DOMAIN } = require('../helpers/config');

module.exports.isAuthorized = function (req, res, next) {
    var usertoken = req.cookies._vcaitoken;

    if (typeof usertoken !== 'undefined') {
        var options = {
            method: "GET",
            url: `https://${API_DOMAIN}/api/Account/userinfo`,
            headers: {
                "content-type": "application/json",
                apikey: usertoken,
            },
        };

        axios
            .request(options)
            .then(function (response) {
                //if successful, add user information to request object
                req.user = response.data;
                next();
            })
            .catch(function (error) {
                console.error(error);
                res.redirect('/');
            });
    } else {
        res.redirect('/');
    }
}
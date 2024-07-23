'use strict';

const axios = require('axios');
const express = require('express');
const { API_DOMAIN } = require('../helpers/config');
const auth = require("./tokenvalidation")

let integrationsRouter = express.Router();

integrationsRouter.get('/', auth.isAuthorized, async (req, res, next) => {
    var userOrgOptions = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/UserOrg/info`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };

    try {
        let [orgresponse] = await Promise.all([
            axios.request(userOrgOptions),
        ]);

        res.render('integrations.html', { page: 'integrations', user: req.user, data: orgresponse.data, title: 'Integration Info' });
    } catch (error) {
        res.json({ error: error });
    }

});

module.exports = integrationsRouter;
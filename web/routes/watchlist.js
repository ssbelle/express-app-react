'use strict';

const axios = require('axios');
const express = require('express');
const { API_DOMAIN } = require('../helpers/config');
const auth = require("./tokenvalidation")

let watchlistRouter = express.Router();

watchlistRouter.get('/delete/:id/:companyid', auth.isAuthorized, async (req, res, next) => {
    var watchlistid = req.params.id;
    var company_id = req.params.companyid;
    var options = {
        method: "POST",
        url: `https://${API_DOMAIN}/api/Watchlist/upsert`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        },
        data: {
            id: watchlistid,
            company_id: company_id,
            enabled: false
        }
    };
    try {
        var response = await axios.request(options);
        res.json({ data: response.data });
    } catch (error) {
        res.json({ error: error });
    }
});

watchlistRouter.get('/overview/:id', auth.isAuthorized, async (req, res, next) => {
    var watchlistid = req.params.id;

    var requestOptions = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/Watchlist/${watchlistid}`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };

    try {
        var response = await axios.request(requestOptions);        

        var fund = response.data.alerts.find(alert => alert.alert_type === 'fund');
        var headcount = response.data.alerts.find(alert => alert.alert_type === 'headcount');
        var leadership = response.data.alerts.find(alert => alert.alert_type === 'leadership');

        response.data.fundalert = fund;
        response.data.headcountalert = headcount;
        response.data.leadershipalert = leadership;

        res.render('companywatchlist.html', { title: 'Company overview', data: response.data });
    } catch (error) {        
        res.json({ error: error });
    }
});

watchlistRouter.post('/save', auth.isAuthorized, async (req, res, next) => {
    const requestData = req.body;
    var options = {
        method: "POST",
        url: `https://${API_DOMAIN}/api/Watchlist/upsert`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        },
        data: requestData
    };
    try {
        var response = await axios.request(options);
        res.json({ data: response.data });
    } catch (error) {
        res.json({ error: error } );
    }
});

watchlistRouter.get('/', auth.isAuthorized, async (req, res, next) => {
    var options = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/Watchlist/user`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };
    try {
        var response = await axios.request(options);        
        res.render('watchlist.html', { page: 'watchlist', user: req.user, data: response.data, title: 'Watchlist' });
    } catch (error) {
        res.json({ error: error });
    }
});

module.exports = watchlistRouter;
'use strict';

const axios = require('axios');
const express = require('express');
const { API_DOMAIN } = require('../helpers/config');
const { formatCurrency, replaceAll } = require('../helpers/utils');
const auth = require("./tokenvalidation")

const mockData = require('../public/mockData/compAnalysisMock.json');
const tableConfigs = require('../public/js/configurations/tableConfigs.json');

let companyRouter = express.Router();

companyRouter.get('/memo/:refid', auth.isAuthorized, async (req, res, next) => {
    var refid = req.params.refid;

    var requestOptions = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/AI/ref/${refid}`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };

    try {
        const [memoResponse] = await Promise.all([
            axios.request(requestOptions)
        ]);
        res.json(memoResponse.data);
    } catch (error) {
        res.json({ error: error });
    }
});

companyRouter.post('/queuememo', auth.isAuthorized, async (req, res, next) => {
    const requestData = req.body;

    var requestOptions = {
        method: "POST",
        url: `https://${API_DOMAIN}/api/AI/queuememo`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        },
        data: { company_id: parseInt(requestData.company_id), template_id: parseInt(requestData.prompt_id), event_id: -1, event_type: 'trigger', template_type: requestData.template_type } 
    };

    try {
        const [memoResponse] = await Promise.all([
            axios.request(requestOptions)
        ]);
        
        res.json(memoResponse.data);
    } catch (error) {
        res.json({ error: error });
    }
});

companyRouter.get('/info/:id', auth.isAuthorized, async (req, res, next) => {
    var companyid = req.params.id;

    var companyInfoOptions = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/Company/${companyid}`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };

    var memoInfoOptions = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/AI/company/${companyid}`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };

    var userTemplateOption = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/Template/search/user`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };

    var orgTemplateOption = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/Template/search/org`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };

    try {
        let [companyinforesponse, userresponse, orgresponse, memoresponse] = await Promise.all([
            axios.request(companyInfoOptions),
            axios.request(userTemplateOption),
            axios.request(orgTemplateOption),
            axios.request(memoInfoOptions)
        ]);

        if (companyinforesponse.data.fundingInfo === undefined) companyinforesponse.data.fundingInfo = [];     

        const fundingData = {
            totalFunding: formatCurrency(companyinforesponse.data.fundingInfo.reduce((a, b) => a + b.amount, 0)),
            investors: companyinforesponse.data.investors = companyinforesponse.data.fundingInfo.flatMap(funding => funding.investors).map(investors => investors.name).filter((value, index, self) => self.indexOf(value) === index) 
        }
        companyinforesponse.data.fundingTotal = fundingData.totalFunding;
        companyinforesponse.data.usertemplates = userresponse.data.templates;
        companyinforesponse.data.orgtemplates = orgresponse.data.templates;
        companyinforesponse.data.memoresponse = memoresponse.data;
        companyinforesponse.data.mock = mockData;
        companyinforesponse.data.configs = tableConfigs;


        res.render('companyinfo.html', { page: 'company', user: req.user, data: companyinforesponse.data, title: 'Company Info' });
    } catch (error) {
        res.json({ error: error });
    }
});
 

module.exports = companyRouter;
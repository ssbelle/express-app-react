'use strict';

const axios = require('axios');
const express = require('express');
const { API_DOMAIN } = require('../helpers/config');
const auth = require("./tokenvalidation")

let agentsRouter = express.Router();

agentsRouter.get('/:id', auth.isAuthorized, async (req, res, next) => {
    var agentid = req.params.id;

    var agentinfoOptions = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/Agent/${agentid}`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };

    var searchRequestOptions = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/Search/savedsearches`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };

    var userAgentsOptions = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/Agent/search/user`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };

    var userOptions = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/Template/search/user`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };

    var globalOptions = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/Template/search/org`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };
    try {
        var agents = {};

        const [userresponse, orgresponse, useragentsreponse, savedsearchresponse, agentinforesponse] = await Promise.all([
            axios.request(userOptions),
            axios.request(globalOptions),
            axios.request(userAgentsOptions),
            axios.request(searchRequestOptions),
            axios.request(agentinfoOptions)
        ]);
       
        agents.usertemplates = userresponse.data.templates;
        agents.orgtemplates = orgresponse.data.templates;
        agents.useragents = useragentsreponse.data;
        agents.savedsearches = savedsearchresponse.data;
        agents.agentinfo = agentinforesponse.data;

        res.render('agents.html', { page: 'agents', user: req.user, data: agents, title: 'Agents' });
    } catch (error) {
        res.json({ error: error });
    }
});

agentsRouter.post('/save', auth.isAuthorized, async (req, res, next) => {
    const requestData = req.body;

    var requestObj = {
        id: parseInt(requestData.agentinfoid && requestData.agentinfoid !== "" ? requestData.agentinfoid : "0"),
        name: requestData.name,
        savedsearch_id: parseInt(requestData.savedsearchoption),
        template_id: parseInt(requestData.prompttemplateoption),
        enabled: (/true/i).test(requestData.enableagent)
    };

    if (requestObj.id === 0) requestObj.enabled = true;
    
    var options = {
        method: "POST",
        url: `https://${API_DOMAIN}/api/Agent/${requestData.agentinfoid && requestData.agentinfoid !== "" ? "update" : "add"}`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        },
        data: requestObj
    };

    try {
        var response = await axios.request(options);
        res.redirect(`/agents/${response.data.id}`);
    } catch (error) {
        res.json({ error: error });
    }
});

agentsRouter.get('/', auth.isAuthorized, async (req, res, next) => {
    var agents = {
        useragents: [],
        usertemplates: [],
        orgtemplates: [],
        savedsearches: []
    };

    var searchRequestOptions = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/Search/savedsearches`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };

    var userAgentsOptions = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/Agent/search/user`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };

    var userOptions = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/Template/search/user`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };

    var globalOptions = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/Template/search/org`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };
    try {
        const [userresponse, orgresponse, useragentsreponse, savedsearchresponse] = await Promise.all([
            axios.request(userOptions),
            axios.request(globalOptions),
            axios.request(userAgentsOptions),
            axios.request(searchRequestOptions)
        ]);
        
        agents.usertemplates = userresponse.data.templates;
        agents.orgtemplates = orgresponse.data.templates;
        agents.useragents = useragentsreponse.data;
        agents.savedsearches = savedsearchresponse.data;
        agents.agentinfo = {};

        res.render('agents.html', { page: 'agents', user: req.user, data: agents, title: 'Agents' });
    } catch (error) {
        res.json({ error: error });
    }
});

module.exports = agentsRouter;
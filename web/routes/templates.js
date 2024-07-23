'use strict';

const axios = require('axios');
const express = require('express');
const { API_DOMAIN } = require('../helpers/config');
const auth = require("./tokenvalidation")

let templatesRouter = express.Router();

templatesRouter.get('/:id', auth.isAuthorized, async (req, res, next) => {
    var templateid = req.params.id;

    var templateinfoOptions = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/Template/id/${templateid}`,
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
        const [templateresponse, userresponse, orgresponse] = await Promise.all([
            axios.request(templateinfoOptions),
            axios.request(userOptions),
            axios.request(globalOptions)
        ]);
        
        var templates = {
            usertemplates: userresponse.data.templates,
            orgtemplates: orgresponse.data.templates,
            templateinfo: templateresponse.data
        };

        res.render('templates.html', { page: 'templates', user: req.user, data: templates, title: 'Memo Templates' });
    } catch (error) {
        res.json({ error: error });
    }
});

templatesRouter.post('/save', auth.isAuthorized, async (req, res, next) => {
    const requestData = req.body;
    var templateObj = {
        name: requestData.target_title,
        description: requestData.target_details,
        makepublic: requestData.templatemakepublic === '1' ? true : false,
        enabled: true,
        prompts: [
            {
                "name": "memo",
                "system_message": requestData.memosysteminstructions,
                "user_message": requestData.memouserinstructions
            },
            {
                "name": "comp",
                "system_message": requestData.compsysteminstructions,
                "user_message": requestData.compuserinstructions
            }
        ]
    };
    var options = {
        method: "POST",
        url: `https://${API_DOMAIN}/api/Template/add`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        },
        data: templateObj
    };

    try {
        var response = await axios.request(options);
        res.redirect(`/templates/${response.data.id}`);        
    } catch (error) {
        res.json({ error: error });
    }
});

templatesRouter.get('/', auth.isAuthorized, async (req, res, next) => {
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
        const [userresponse, orgresponse] = await Promise.all([
            axios.request(userOptions),
            axios.request(globalOptions)
        ]);

        var templates = {
            usertemplates: userresponse.data.templates,
            orgtemplates: orgresponse.data.templates,
            templateinfo: {}
        };
        res.render('templates.html', { page: 'templates', user: req.user, data: templates, title: 'Memo Templates' });
    } catch (error) {
        res.json({ error: error });
    }
});

module.exports = templatesRouter;
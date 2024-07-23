'use strict';

const axios = require('axios');
const express = require('express');
const { API_DOMAIN } = require('../helpers/config');
const { formatCurrency, replaceAll } = require('../helpers/utils');
const auth = require("./tokenvalidation")
const mockData = require('../public/mockData/compAnalysisMock.json');
const tableConfigs = require('../public/js/configurations/tableConfigs.json');

const reactSearchFlow = require
let searchRouter = express.Router();

function formatNumber(num, precision = 2) {
    const map = [
        { suffix: 'T', threshold: 1e12 },
        { suffix: 'B', threshold: 1e9 },
        { suffix: 'M', threshold: 1e6 },
        { suffix: 'K', threshold: 1e3 },
        { suffix: '', threshold: 1 },
    ];

    const found = map.find((x) => Math.abs(num) >= x.threshold);
    if (found) {
        const formatted = (num / found.threshold).toFixed(precision) + found.suffix;
        return formatted;
    }

    return num;
};

searchRouter.get('/cv/tags/:id', auth.isAuthorized, async (req, res, next) => {
    var requestObj = {
        cvtype: parseInt(req.params.id)
    };

    var requestOptions = {
        method: "POST",
        url: `https://${API_DOMAIN}/api/Search/cv`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        },
        data: requestObj
    };

    try {
        var response = await axios.request(requestOptions);
        response.data.mock = mockData;
        response.data.configs = tableConfigs;
        res.json(response.data);
    } catch (error) {
        res.json({ error: error });
    }
});

searchRouter.get('/company/overview/:id', auth.isAuthorized, async (req, res, next) => {
    var companyId = req.params.id;

    var requestOptions = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/Company/${companyId}`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };

    try {
        var response = await axios.request(requestOptions);
        if (response.data.employees === undefined) response.data.employees = [];
        if (response.data.fundingInfo === undefined) response.data.fundingInfo = [];        
        if (response.data.tags === undefined) response.data.tags = [];        

        response.data.totalfunding = formatCurrency(response.data.fundingInfo.reduce((a, b) => a + b.amount, 0));
        response.data.investors = response.data.fundingInfo.flatMap(funding => funding.investors).map(investors => investors.name).filter((value, index, self) => self.indexOf(value) === index);

        var execs = response.data.employees.filter((user) => {
            return user.title.toLowerCase().includes("founder") ||
                user.title.toLowerCase().startsWith("chief") ||
                user.title.toLowerCase() === "ceo" ||
                user.title.toLowerCase() === "cto";
        });

        response.data.execs = execs;     
        response.data.mock = mockData;
        response.data.configs = tableConfigs;

        res.render('companyoverview.html', { title: 'Company overview', data: response.data });
    } catch (error) {
        console.log(error);
        res.json({ error: error });
    }
});

searchRouter.get('/list', auth.isAuthorized, async (req, res, next) => {
    if (!req.query.search) res.json({});
    else {
        var searchRequest = {
            query: req.query.search,
            type: parseInt(req.query.type)
        };

        var requestOptions = {
            method: "POST",
            url: `https://${API_DOMAIN}/api/Search/list`,
            headers: {
                "content-type": "application/json",
                "apikey": req.cookies._vcaitoken
            },
            data: searchRequest
        };

        try {
            var response = await axios.request(requestOptions);
            response.data.mock = mockData;
            response.data.configs = tableConfigs;
            res.json(response.data);
        } catch (error) {
            res.json({ error: error });
        }
    }
});

searchRouter.post('/save', auth.isAuthorized, async (req, res, next) => {
    const requestData = req.body;

    var requestOptions = {
        method: "POST",
        url: `https://${API_DOMAIN}/api/Search/save`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        },
        data: requestData
    };
    try {
        var response = await axios.request(requestOptions);   
        response.data.mock = mockData;
        response.data.configs = tableConfigs;     
        res.json(response.data);
    } catch (error) {
        res.json(error);
    }
});

searchRouter.get('/:id', auth.isAuthorized, async (req, res, next) => {
    var savedSearchId = parseInt(req.params.id);

    var searchRequestOptions = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/Search/savedsearches/${savedSearchId}`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };

    try {
        var savedSearchByIdResponse = await axios.request(searchRequestOptions);

        var requestOptions = {
            method: "POST",
            url: `https://${API_DOMAIN}/api/Search/companies`,
            headers: {
                "content-type": "application/json",
                "apikey": req.cookies._vcaitoken
            },
            data: savedSearchByIdResponse.data
        };

        searchRequestOptions = {
            method: "GET",
            url: `https://${API_DOMAIN}/api/Search/savedsearches/`,
            headers: {
                "content-type": "application/json",
                "apikey": req.cookies._vcaitoken
            }
        };

        var response = await axios.request(requestOptions);
        var savedSearchResponse = await axios.request(searchRequestOptions);
        var totalPrefix = response.data.total > 499 ? "Over " : "";

        response.data.totalPrefix = totalPrefix;
        response.data.savedSearches = savedSearchResponse.data;
        response.data.mock = mockData;
        response.data.configs = tableConfigs;

        //res.cookie('_vcairecentsearch', JSON.stringify(savedSearchByIdResponse.data), { HttpOnly: true, expire: 24 * 60 * 60 * 1000 });
        res.render('search.html', { page: 'search', user: req.user, title: 'Search', data: response.data });
    } catch (error) {
        console.log(error);
        res.render('search.html', { page: 'search', user: req.user, title: 'Search', data: [], error: error });
    }
});

searchRouter.post('/', auth.isAuthorized, async (req, res, next) => {
    const requestData = req.body;

    // Should be moved elsehwere for new repo
    // Filter these properties out because they have a default value in a search query that should not be displayed as a filter badge
    const whiteListFilters = ["funding", "fundingtype", "foundingyear", "headcount","headcounttraction", "headcounttraction_type", "headcounttype", "searchcompanyname", "searchtags", "websitetraction", "websitetraction_type"  ]
    
    let searchFormData = Object.entries(requestData).filter((item) => {
        if(whiteListFilters.includes(item[0])) {
            // If the property is on the whiteList, but has a real value, not the default value, include it
            if(item[1] !== "" && item[1] !== "0" && item[1] !== "90"){
                return item
            }
        } else {
            return item[0];
        }
    });


    var searchcompanyname = requestData.searchcompanyname;

    var search_tags = Array.isArray(requestData.searchtags) ? requestData.searchtags : new Array(requestData.searchtags);
    var search_investors = Array.isArray(requestData.searchinvestors) ? requestData.searchinvestors : new Array(requestData.searchinvestors);
    var search_universities = Array.isArray(requestData.universities) ? requestData.universities : new Array(requestData.universities);
    var people_hightlight = Array.isArray(requestData.peoplehightlight) ? requestData.peoplehightlight : new Array(requestData.peoplehightlight);
    var funding_rounds = Array.isArray(requestData.fundingrounds) ? requestData.fundingrounds : new Array(requestData.fundingrounds);
    var locations = Array.isArray(requestData.searchlocation) ? requestData.searchlocation : new Array(requestData.searchlocation);

    var headcounttraction_type = parseInt(requestData.headcounttraction_type);
    var headcounttraction = requestData.headcounttraction ? parseInt(requestData.headcounttraction) : 0;
    var websitetraction_type = parseInt(requestData.websitetraction_type);
    var websitetraction = requestData.websitetraction ? parseInt(requestData.websitetraction) : 0;

    var headcount_type = parseInt(requestData.headcounttype);
    var headcount = requestData.headcount ? parseInt(requestData.headcount) : 0;
    var funding_type = parseInt(requestData.fundingtype);
    var funding = requestData.funding ? parseInt(requestData.funding) : 0;
    var founding_year = requestData.foundingyear;

    if (requestData.searchtags === undefined) search_tags = new Array();
    if (requestData.searchinvestors === undefined) search_investors = new Array();
    if (requestData.universities === undefined) search_universities = new Array();
    
    var searchObj = {
        "company_name": searchcompanyname,
        "tags": search_tags,
        "investors": search_investors,
        "universities": search_universities,
        "founding_year": founding_year,
        "people_hightlight": people_hightlight,
        "funding_rounds": funding_rounds,
        "locations": locations,
        "headcount": {
            "filter": headcount_type,
            "value": headcount
        },
        "headcount_traction": {
            "filter": headcounttraction_type,
            "value": headcounttraction
        },
        "website_traction": {
            "filter": websitetraction_type,
            "value": websitetraction
        },
        "funding": {
            "filter": funding_type,
            "value": funding
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

    var requestOptions = {
        method: "POST",
        url: `https://${API_DOMAIN}/api/Search/companies`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        },
        data: searchObj
    };


    try {

        let [response, savedSearchResponse] = await Promise.all([
            axios.request(requestOptions),
            axios.request(searchRequestOptions)
        ]);
        var totalPrefix = response.data.total > 499 ? "Over " : "";

        response.data.totalPrefix = totalPrefix;
        response.data.savedSearches = savedSearchResponse.data;
        response.data.mock = mockData;
        response.data.configs = tableConfigs;
        response.data.searchFormData = searchFormData || []

        res.cookie('_vcairecentsearch', JSON.stringify(searchObj), { HttpOnly: true, expire: 24 * 60 * 60 * 1000 });
        res.render('search.html', { page: 'search', user: req.user, title: 'Search', data: response.data });
    } catch (error) {
        res.render('search.html', { page: 'search', user: req.user, title: 'Search', error: error });
    }
});

searchRouter.get('/', auth.isAuthorized, async function (req, res, next) {
    var searchObj = {
        "mostRecentOnly": true,
        "limit": 100
    };
    

    var requestOptions = {
        method: "POST",
        url: `https://${API_DOMAIN}/api/Search/companies`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        },
        data: searchObj
    };


    var searchRequestOptions = {
        method: "GET",
        url: `https://${API_DOMAIN}/api/Search/savedsearches`,
        headers: {
            "content-type": "application/json",
            "apikey": req.cookies._vcaitoken
        }
    };
    try {
        let [response, savedSearchResponse] = await Promise.all([
            axios.request(requestOptions),
            axios.request(searchRequestOptions)
           
        ]);

        response.data.totalPrefix = "Most recently founded startups";
        response.data.savedSearches = savedSearchResponse.data;
        response.data.mock = mockData;
        response.data.configs = tableConfigs;

        res.cookie('_vcairecentsearch', JSON.stringify(searchObj), { HttpOnly: true, expire: 24 * 60 * 60 * 1000 });
        res.render('search.html', { page: 'search', user: req.user, title: 'Search', data: response.data });
    } catch (error) {
        res.render('search.html', { page: 'search', user: req.user, title: 'Search', data: [], error: error });
    } 
});

module.exports = searchRouter;
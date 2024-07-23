"use strict";

$(document).ready(function () {
    _companyPg.init();
});

var _companyPg = {

    //Should find a better way to save state
    currentRefId: "",
    currentRefType: "",

    /**
    * This function is called when the page is loaded. $(document).ready()
    */
    init: async function () {
        var contacts = {
            socialMedia: _companyOverview.socialMedia,
            contacts: _companyOverview.contacts
        };
    
        delete _companyOverview.employees;
        delete _companyOverview.fundingInfo;
        delete _companyOverview.socialMedia;
        delete _companyOverview.contacts;
        delete _companyOverview.orgtemplates;
        delete _companyOverview.usertemplates;
        delete _companyOverview.memoresponse;
    },

    /**
     * Query the backend to get the memo generated
     */
    queryMemo: function (refId) {
        fetch(`/company/memo/${refId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
            .then(res => {
                if (res.find(s => s.ref_id === _companyPg.currentRefId)["status"] === "queued") {
                    setTimeout(() => {
                        _companyPg.queryMemo(_companyPg.currentRefId);
                    }, 2000);
                } else {
                    var button = document.querySelector("#generateMemoBtn");
                    button.setAttribute("data-kt-indicator", "off");
                    var memoResponse = res.find(s => s.ref_id === _companyPg.currentRefId);
                    if (currentRefType === "memo") {
                        document.getElementById("investmentmemo").innerHTML = memoResponse.response;
                    }
                }
            });
    },

    /**
     * Queue the current company for the backend to generate the memo
     * Called from html: id="generateMemoBtn"
     */
    generateMemo: function () {
        var promptTemplateId = document.getElementById("prompttemplateoption").value
        if (promptTemplateId === '') {
            alert("Select a template");
            return false;
        } else {
            var button = document.querySelector("#generateMemoBtn");
            button.setAttribute("data-kt-indicator", "on");

            fetch('/company/queuememo', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt_id: promptTemplateId,
                    company_id: _companyOverview.id,
                    template_type: "memo"
                })
            }).then(res => res.json())
                .then(res => {
                    _companyPg.currentRefId = res.ref_id;
                    _companyPg.currentRefType = "memo";
                    if (res.status === "queued") queryMemo(currentRefId);
                });
        }
    }
};
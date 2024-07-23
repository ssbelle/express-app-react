"use strict";


$(document).ready(function () {
    _searchPg.init();
});

var _searchPg = {

    //This variable is used to keep track of which company id the user clicked for the drawer/side panel to show
    //Should find a better way to save state
    currentCompanyDrawerId: "",

    /**
     * This function is called when the page is loaded. $(document).ready()
     */
    init: function () {
        this.searchBtn();
        this.advancedSearchBtn();
        this.drawerSliderModel();
        this.initYearPickerPlugin();
        this.setSearchFilterFundingRounds();
        this.setSearchFilterPeopleHighlight();
        this.setSearchFilterCompanyCategories();
        this.setAutoCompleteFn();
    },

    /**
     * When Company info "view" button is clicked, save the "company id" value for the model to read
     */
    setDrawerCompanyId: function (companyId) {
        this.currentCompanyDrawerId = companyId;
        return true;
    },

    /**
     * The function is used to save the most recent search. 
     * The most recent search info is saved in the cookie, Its saved in the cookie as a way to track when the page is refreshed.
     * The code reads the cookie first and that information is sent to the backend to save
     */
    saveSearch: function () {
        var recentSearchObject = JSON.parse(decodeURIComponent(this.getCookieValue("_vcairecentsearch")));
        var searchname = document.getElementById("savedsearchname").value || "";

        if (searchname.trim() === "") {
            $("#requiredsearchname").removeClass("d-none");
        } else {
            $("#requiredsearchname").addClass("d-none");
            recentSearchObject.savedsearch_name = searchname;

            fetch('/search/save', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(recentSearchObject)
            }).then(res => res.json())
                .then(res => {
                    if (res.error) {
                        $("#failedsavedsearch").removeClass("d-none");
                        $("#successsavedsearch").addClass("d-none");
                    } else {
                        $("#failedsavedsearch").addClass("d-none");
                        $("#successsavedsearch").removeClass("d-none");

                        setTimeout(() => {
                            const truck_modal = document.querySelector('#kt_savemodal_1');
                            const modal = bootstrap.Modal.getInstance(truck_modal);
                            modal.hide();
                        }, 2000);
                    }
                });
        }
    },

    /*
     * Get Cookie data - Probably should be moved to a helper.js file or something.
     */
    getCookieValue: function (name) {
        const regex = new RegExp(`(^| )${name}=([^;]+)`)
        const match = document.cookie.match(regex)
        if (match) {
            return match[2]
        }
    },

    /**
     * This function displays the saved search info when the user clicks on their "saved searches" in the accordian
     * Read the _userSavedSearches object from the HTML page and find the one the user clicked and display it on the model
     */
    setCurrentSavedSearch: function (savedSearchId) {
        var savedSearchModal = new bootstrap.Modal(document.getElementById("savedsearch_modal"), {});
        var userSavedSearchesObj = JSON.parse(_userSavedSearches);
        var searchdata = userSavedSearchesObj.usersearches.find(search => search.id === parseInt(savedSearchId));
        document.getElementById('savedSearchTitle').innerHTML = searchdata.savedsearch_name;

        const savedSearchBody = document.getElementById('savedSearchBody');
        document.getElementById("savedsearchhref").href = `/search/${savedSearchId}`;
        savedSearchBody.innerHTML = prettyPrintJson.toHtml(searchdata, {
            lineNumbers: false
        });

        savedSearchModal.show();
        return true;
    },

    /**
     * Add the company to the users watchlist. 
     * In the side panel drawer/model, when "add to watchlist" button is clicked trigger this function
     * This function reads "currentCompanyDrawerId" variable that was set in "setDrawerCompanyId" function to know which companyId to add to the watchlist
     */
    addCompanyToWatchlist: function () {
        fetch('/watchlist/save', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                company_id: this.currentCompanyDrawerId
            })
        }).then(res => res.json())
            .then(res => {
                if (res.error) {
                    Swal.fire({
                        text: "Failed to save. Try again later. ",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn btn-danger"
                        }
                    });
                } else {
                    Swal.fire({
                        text: "Saved to watchlist.",
                        icon: "success",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn btn-primary"
                        }
                    });
                }
            });
    },
    /**
     * When the primary textbased search button is clicked
     * The function add's the spinner animation when the button is clicked
     */
    searchBtn: function () {
        var searchbutton = document.querySelector("#searchsumitbtn");
        searchbutton.addEventListener("click", function (e) {
            searchbutton.setAttribute("data-kt-indicator", "on");
            $('#searchform').submit();
        });
    },

    /**
     * When the advanced search button with filters is clicked
     * The function add's the spinner animation when the button is clicked
     */
    advancedSearchBtn: function () {
        var advsearchsumitbtn = document.querySelector("#advsearchsumitbtn");
        var emptyPlaceholderFilterTab = document.querySelector("#kt_tab_pane_14");
        advsearchsumitbtn.addEventListener("click", function (e) {
          e.preventDefault();
            // TODO: Possibly grab empty unsaved filter tab and trigger attribute / class / active change from here depending on timing
            let formData = Object.fromEntries(new FormData(document.querySelector('#searchform')).entries());

            const triggerFilterSearchTab = new CustomEvent("filterSearchTab", { detail: formData });
         
            window.localStorage.setItem("searchTabActive", "placeholder-unsaved-tab");
            window.dispatchEvent(triggerFilterSearchTab);
            advsearchsumitbtn.setAttribute("data-kt-indicator", "on");
            $('#searchform').submit(function(e){
                e.preventDefault();
            });

           
        });
    },

    /**
     * When the Drawer/Side panel model is displayed
     * The function reads the "currentCompanyDrawerId" variable set by "setDrawerCompanyId" function and queries the backend to fetch the company info
     */
    drawerSliderModel: function () {
        var drawerElement = document.querySelector("#kt_drawer_example_basic");
        var drawer = KTDrawer.getInstance(drawerElement);

        //when the model is in view, show loading icon
        drawer.on("kt.drawer.shown", function () {
            drawerElement.innerHTML = '<div class="overlay d-flex justify-content-center align-items-center w-100"><div class=""><div class="spinner-border" role="status" style="width: 3rem; height: 3rem; z-index: 20;"><span class="sr-only">Loading...</span></div></div></div>';

            fetch(`/search/company/overview/${_searchPg.currentCompanyDrawerId}`).then(response => {
                return response.text();
            }).then(userData => {
                drawerElement.innerHTML = userData;
            }).catch(function () {
                console.log("ERROR");
            });
        });
    },

    /**
     * The advanced search has a Founding year filter that displays "year" for the user to select
     */
    initYearPickerPlugin: function () {
        var dtpicker = new tempusDominus.TempusDominus(document.getElementById("kt_td_picker_date_only"), {
            allowInputToggle: true,
            dateRange: false,
            restrictions: {
                minDate: '2010',
                maxDate: new Date().getFullYear().toString()
            },
            localization: {
                format: 'yyyy',
            },
            display: {
                viewMode: "years",
                components: {
                    decades: false,
                    year: true,
                    month: false,
                    date: false,
                    hours: false,
                    minutes: false,
                    seconds: false
                }
            }
        });
    },

    /**
     * Get and Set funding rounds details. 
     * First check the local cache and if nothing then call the API
     * Funding rounds don't typically change much, so no issues caching them.
     * Funding rounds example: Series A,B,C etc.
     */
    setSearchFilterFundingRounds: function () {
        var fundingRoundsTags = ls.get('_vcaisearchfundingrounds');

        if (fundingRoundsTags === null || fundingRoundsTags === undefined) {
            fetch(`/search/cv/tags/3`).then(response => {
                return response.json();
            }).then(fundingrounds => {
                ls.set('_vcaisearchfundingrounds', fundingrounds, {
                    ttl: 604800
                }); //7days ttl
                $("#fundingrounds").select2({
                    placeholder: "Funding Type",
                    allowClear: false,
                    data: fundingrounds
                });
            }).catch(function () {
                console.log("ERROR");
            });
        } else {
            $("#kt_fundingrounds").select2({
                placeholder: "Funding Type",
                allowClear: false,
                data: fundingRoundsTags
            });
        }
    },

    /**
     * Get and Set Execs/Peoples Hightlights details. 
     * First check the local cache and if nothing then call the API
     * Peoples Hightlight "could" change often but the tags are quite standard ATM. 
     * Note: probably should reduce the TTL for the cache compared to others.
     */
    setSearchFilterPeopleHighlight: function () {
        var peoplehightlight = ls.get('_vcaisearchpeoplehighlights');

        if (peoplehightlight === null || peoplehightlight === undefined) {
            fetch(`/search/cv/tags/4`).then(response => {
                return response.json();
            }).then(peoplehightlights => {
                ls.set('_vcaisearchpeoplehighlights', peoplehightlights, {
                    ttl: 604800
                }); //7days ttl
                $("#kt_peoplehightlight").select2({
                    placeholder: "Exec Highlights",
                    allowClear: false,
                    data: peoplehightlights
                });
            }).catch(function () {
                console.log("ERROR");
            });
        } else {
            $("#kt_peoplehightlight").select2({
                placeholder: "Exec Highlights",
                allowClear: false,
                data: peoplehightlight
            });
        }
    },

    /**
     * Get and Set Company categories details. 
     * First check the local cache and if nothing then call the API
     * Company categories "could" change often but the tags are quite standard ATM. 
     * Note: probably should reduce the TTL for the cache compared to others.
     */
    setSearchFilterCompanyCategories: function () {
        var searchTags = ls.get('_vcaisearchtags');

        if (searchTags === null || searchTags === undefined) {
            fetch(`/search/cv/tags/0`).then(response => {
                return response.json();
            }).then(tags => {
                ls.set('_vcaisearchtags', tags, {
                    ttl: 604800
                }); //7days ttl
                this.bindCompanyCategoriesFilter(tags);
            }).catch(function () {
                console.log("ERROR");
            });
        } else {
            this.bindCompanyCategoriesFilter(searchTags);
        }
    },

    /**
     * Bind the dropdown values using the information from "setSearchFilterCompanyCategories" function
     */
    bindCompanyCategoriesFilter: function (searchTags) {
        $("#kt_customertype").select2({
            placeholder: "Customer Type",
            allowClear: false,
            data: searchTags.find(tag => tag.id === "Customer Type").children
        });

        $("#kt_industry").select2({
            placeholder: "Industries",
            allowClear: false,
            data: searchTags.find(tag => tag.id === "Industry").children
        });

        $("#kt_marketvertical").select2({
            placeholder: "Market Vertical",
            allowClear: false,
            data: searchTags.find(tag => tag.id === "Market Vertical").children
        });

        $("#kt_producttype").select2({
            placeholder: "Product Type",
            allowClear: false,
            data: searchTags.find(tag => tag.id === "Product Type").children
        });

        $("#kt_technology").select2({
            placeholder: "Technology Space",
            allowClear: false,
            data: searchTags.find(tag => tag.id === "Technology").children
        });

        $("#kt_technologytype").select2({
            placeholder: "Technology type",
            allowClear: false,
            data: searchTags.find(tag => tag.id === "Technology Type").children
        });

        $("#kt_others").select2({
            placeholder: "Other Info (YC Batch)",
            allowClear: false,
            data: searchTags.find(tag => tag.id === "Yc Batch").children
        });
    },

    /**
     * Bind select2 automcomplete plugin to a dom element.
     * This is called from "setAutoCompleteFn"
     */
    bindAutoComplete: function (dom, placeHolder, propType) {
        $('#' + dom).select2({
            placeholder: placeHolder,
            allowClear: false,
            language: {
                searching: function () {
                    return "Start typing...";
                }
            },
            ajax: {
                url: '/search/list',
                data: function (params) {
                    var query = {
                        search: params.term,
                        type: propType.toString()
                    }
                    return query;
                },
                processResults: function (data) {
                    var results = [];
                    data.list.map(function (element) {
                        results.push({
                            "id": element,
                            "text": element
                        });
                    });
                    return {
                        results: results
                    };
                },
                cache: true
            }
        });
    },

    /**
     * Set the automcomplete functionality
     */
    setAutoCompleteFn: function () {
        this.bindAutoComplete('kt_location', 'Location lookup', 1);
        this.bindAutoComplete('kt_investors', 'Investors lookup', 1);
        this.bindAutoComplete('kt_universities', 'Execs from Universities lookup', 2);
    }
};
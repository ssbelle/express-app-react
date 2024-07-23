"use strict";

$(document).ready(function () {
    _watchlistPg.init();
});

var _watchlistPg = {

    //Should find a better way to save state
    currentwatchlistid: "",
    currentwatchlistcompanyid: "",

    /**
     * This should be moved to some helper.js file.
     * Duplicated in search.js file too.
     */
    getCookieValue: function (name) {
        const regex = new RegExp(`(^| )${name}=([^;]+)`)
        const match = document.cookie.match(regex)
        if (match) {
            return match[2]
        }
    },

    /**
     * When Company info "view" button is clicked, save the "company id" value for the drawer/model to read
     */
    setDrawerWatchlistId: function (id, companyid) {
        this.currentwatchlistid = id;
        this.currentwatchlistcompanyid = companyid;
        return true;
    },

    /**
     * Delete a specific company from the users watchlist
     */
    deletewatchlist: function () {
        fetch(`/watchlist/delete/${this.currentwatchlistid}/${this.currentwatchlistcompanyid}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
            .then(res => {
                if (res.error) {
                    Swal.fire({
                        text: "Failed to delete. Try again later. ",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn btn-danger"
                        }
                    });
                } else {
                    var element = document.querySelector(`#watchlist_${this.currentwatchlistid}`);
                    element.classList.add("btn-light-danger", "disabled");
                    element.innerText = 'Removed';
                    element.disabled = true;

                    Swal.fire({
                        text: "Deleted watchlist.",
                        icon: "success",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn btn-primary"
                        }
                    }).then((value) => {
                        if (value) KTDrawer.hideAll();
                    });
                }
            });
    },

    /**
     * Update watchlist information 
     * Notes and alerts information
     */
    updatewatchlist: function () {
        var alerts = [];

        if (document.querySelector('#watchlistfund').checked)
            alerts.push({
                alert_type: 'fund',
                value: '0',
                is_active: true
            });

        if (document.querySelector('#watchlistheadcount').checked && document.getElementById('headcountincrease').value !== "")
            alerts.push({
                alert_type: 'headcount',
                value: document.getElementById('headcountincrease').value,
                is_active: true
            });

        if (document.querySelector('#watchlistleadership').checked)
            alerts.push({
                alert_type: 'leadership',
                value: '0',
                is_active: true
            });

        var watchlistinfo = {
            id: this.currentwatchlistid,
            company_id: this.currentwatchlistcompanyid,
            notes: document.getElementById('watchlistnotes').value,
            enabled: true,
            alerts: alerts
        };

        fetch('/watchlist/save', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(watchlistinfo)
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
     * Initialize the drawer/side view plugin
     */
    bindDrawerFn: function () {
        var drawerElement = document.querySelector("#kt_drawer_example_dismiss");
        var drawer = KTDrawer.getInstance(drawerElement);

        drawer.on("kt.drawer.shown", function () {
            drawerElement.innerHTML = '<div class="overlay d-flex justify-content-center align-items-center w-100"><div class=""><div class="spinner-border" role="status" style="width: 3rem; height: 3rem; z-index: 20;"><span class="sr-only">Loading...</span></div></div></div>';

            fetch(`/watchlist/overview/${_watchlistPg.currentwatchlistid}`).then(response => {
                return response.text();
            }).then(userData => {
                drawerElement.innerHTML = userData;
            }).catch(function () {
                console.log("ERROR");
            });
        });
    },

    init: function () {
        this.bindDrawerFn();
    }
};
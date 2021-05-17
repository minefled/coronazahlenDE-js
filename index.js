const fetch = require("node-fetch");

class Client {
    constructor(config={}) {
        this._requestDates = [];

        this.config = this.complete_config(config);
    }

    // init
    complete_config(raw_config) {
        var config = {};

        if(raw_config.hasOwnProperty("preventRateLimitErrors")) {config["preventRateLimitErrors"] = raw_config["preventRateLimitErrors"]} else {config["preventRateLimitErrors"] = true;}

        return config;
    }

    // functions to prevent from hitting the rate limit
    _madeRequest() {
        this._requestDates.push(new Date());
        this.cleanRequests();
    }
    cleanRequests() {
        // removes all requests that are older than 1 minute
        for(var i=0;i<this._requestDates.length;i++) {
            var timeDelta = new Date().getTime() - this._requestDates[i].getTime();

            if(timeDelta > 60) {
                removeElementFromArrayAtIndex(this._requestDates, i);
            }
        }
    }
    canMakeRequest() {
        this.cleanRequests();
        return this._requestDates.length < 15 || !this.config.preventRateLimitErrors;
    }

    // fetching the endpoints
    async get(name) {
        if(name.toLowerCase() == "germany") {
            return await this.fetchGermany();
        }
    }

    async fetchGermany() {
        if(!this.canMakeRequest()) {return;}
        this._madeRequest();

        var endpointURI = `https://api.corona-zahlen.org/germany`;
        return fetch(endpointURI)
            .then(response => response.json())
            .then(rawData => {
                // only return the important data
                var data = {
                    "cases": rawData.cases,
                    "deaths": rawData.deaths,
                    "recovered": rawData.recovered,
                    "weekIncidence": roundFloat(rawData.weekIncidence, 2),
                    "casesPer100k": roundFloat(rawData.casesPer100k, 2),
                    "casesPerWeek": rawData.casesPerWeek,
                    "delta": rawData.delta
                };
                return data;
            });
    }
    async fetchCasesHistoryGermany(days=0) {
        if(!this.canMakeRequest()) {return;}
        this._madeRequest();

        if(days == 0 || days == null || days == undefined) {
            var endpointURI = `https://api.corona-zahlen.org/germany/history/cases/`;
        } else {
            var endpointURI = `https://api.corona-zahlen.org/germany/history/cases/${days}`;
        }

        return fetch(endpointURI)
            .then(response => response.json())
            .then(rawData => {
                var data = rawData.data;
                return data;
            });
    }
    async fetchDeathsHistoryGermany(days=0) {
        if(!this.canMakeRequest()) {return;}
        this._madeRequest();

        if(days == 0 || days == null || days == undefined) {
            var endpointURI = `https://api.corona-zahlen.org/germany/history/deaths/`;
        } else {
            var endpointURI = `https://api.corona-zahlen.org/germany/history/deaths/${days}`;
        }

        return fetch(endpointURI)
            .then(response => response.json())
            .then(rawData => {
                var data = rawData.data;
                return data;
            });
    }
    async fetchRecoveredHistoryGermany(days=0) {
        if(!this.canMakeRequest()) {return;}
        this._madeRequest();

        if(days == 0 || days == null || days == undefined) {
            var endpointURI = `https://api.corona-zahlen.org/germany/history/recovered/`;
        } else {
            var endpointURI = `https://api.corona-zahlen.org/germany/history/recovered/${days}`;
        }

        return fetch(endpointURI)
            .then(response => response.json())
            .then(rawData => {
                var data = rawData.data;
                return data;
            });
    }
    async fetchIncidenceHistoryGermany(days=0) {
        if(!this.canMakeRequest()) {return;}
        this._madeRequest();

        if(days == 0 || days == null || days == undefined) {
            var endpointURI = `https://api.corona-zahlen.org/germany/history/incidence/`;
        } else {
            var endpointURI = `https://api.corona-zahlen.org/germany/history/incidence/${days}`;
        }

        return fetch(endpointURI)
            .then(response => response.json())
            .then(rawData => {
                var data = rawData.data;
                return data;
            });
    }
    async fetchAgegroupsGermany() {
        if(!this.canMakeRequest()) {return;}
        this._madeRequest();

        var endpointURI = `https://api.corona-zahlen.org/germany/age-groups`;

        return fetch(endpointURI)
            .then(response => response.json())
            .then(rawData => {
                var data = rawData.data;

                data.getForAge = function(age=0) {
                    if(age < 5) {return this["A00-A04"];}
                    if(age > 4 && age < 15) {return this["A05-A14"];}
                    if(age > 14 && age < 35) {return this["A15-A34"];}
                    if(age > 34 && age < 60) {return this["A35-A59"];}
                    if(age > 59 && age < 80) {return this["A60-A79"];}
                    if(age > 79) {return this["A80+"];}
                };

                return data;
            });
    }
}

function removeElementFromArrayAtIndex(array, index) {
    return array.splice(index, index+1);
}
function roundFloat(float, digits) {
    return Math.floor(float * (10**digits)) / (10**digits);
}

exports.Client = Client;
exports.utils= {"ArrayPop":removeElementFromArrayAtIndex,"roundFloat":roundFloat};
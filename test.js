const coronazahlen = require("./index");

let myClient = new coronazahlen.Client();

// Ganz Deutschland
async function fetchDE() {
    var data = await myClient.fetchGermany();
    console.log(data);
}
async function fetchDEHistory() {
    var data = await myClient.fetchAgegroupsGermany();
    console.log(data.getForAge(60));
}

fetchDE();
fetchDEHistory();
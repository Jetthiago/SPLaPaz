
var updateTable = function () {
    var date = new Date();
    var nextChange = new Date();
    var hours = date.getHours();
    var timeout = 0;
    if (hours >= 5 && hours < 14) {
        nextChange.setHours(14);
        nextChange.setMinutes(0);
    } else if (hours >= 14 && hours < 22) {
        nextChange.setHours(22);
        nextChange.setMinutes(0);
    } else {
        nextChange.setHours(5);
        nextChange.setMinutes(0);
        nextChange.setDate(date.getDate() + 1);
    }
    timeout = nextChange.getTime() - date.getTime();
    console.log("timeout: " + timeout + " nextchange: "+ nextChange.getHours());
    setTimeout(function () {
        router_client.reload();
        updateTable();
    }, timeout);
}
updateTable();


//
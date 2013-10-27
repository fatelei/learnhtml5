function Storage(type) {
    this.type = type;
}

Storage.prototype.get_storage = function () {
    switch (this.type) {
        case "localstorage":
            return window.localStorage;
        case "indexeddb":
            return window.indexedDB;
        case "websql":
            return window.openDatabase;
        default:
            return undefined;       
    }
};

function onError(err) {
    console.log(err);
}

function onSuccessExecuteSql(tx, results) {
    console.log("Execute sql completed!");
}

function onReadyTransaction() {
    console.log("Transaction completed");
}

function displayResults(tx, results) {
    console.log(results.rows.length);
}
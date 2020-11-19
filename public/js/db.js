let db;
// create a new db request for a "budget" database.
const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  // create object store called "pending" and set autoIncrement to true
    const db = event.target.result;
    const objectStore = db.createObjectStore("pending", {autoIncrement: true});
    objectStore.createIndex("pending", "value");
};

request.onsuccess = function (event) {
    db = event.target.result;

if (navigator.onLine) {
checkDatabase();
}
};

// log error here
request.onerror = (event) => {console.log("error", event.target.errorCode)};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
    let transaction = db.transaction(["pending"], "readwrite");
    // access your pending object store
    let pending = transaction.objectStore("pending");
    // add record to your store with add method.
    pending.add(record)
}

function checkDatabase() {
  // open a transaction on your pending db
    let transaction = db.transaction(["pending"], "readwrite");
    // access your pending object store
    let pending = transaction.objectStore("pending");
    // get all records from store and set to a variable
    let getAll = pending.getAll()

    getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
        },
        })
        .then((response) => response.json())
        .then(() => {
            // if successful, open a transaction on your pending db
            let transaction = db.transaction(["pending"], "readwrite");
            // access your pending object store
            let pending = transaction.objectStore("pending");
            // clear all items in your store
            pending.clear();
        });
    }
    };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
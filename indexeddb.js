// indexeddb.js
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('offline-db', 1);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('data')) {
                db.createObjectStore('data', { keyPath: 'id', autoIncrement: true });
            }
        };
        
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        
        request.onerror = (event) => {
            reject('IndexedDB error: ' + event.target.errorCode);
        };
    });
}

function addData(data) {
    return openDatabase().then((db) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('data', 'readwrite');
            const store = transaction.objectStore('data');
            const request = store.put(data);
            
            request.onsuccess = () => {
                resolve('Data added successfully.');
            };
            
            request.onerror = (event) => {
                reject('Error adding data: ' + event.target.errorCode);
            };
        });
    });
}

function getAllData() {
    return openDatabase().then((db) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('data', 'readonly');
            const store = transaction.objectStore('data');
            const request = store.getAll();
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                reject('Error retrieving data: ' + event.target.errorCode);
            };
        });
    });
}

// Delete data from IndexedDB
function deleteData(id) {
    return openDatabase().then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('data', 'readwrite');
            const store = transaction.objectStore('data');
            const request = store.delete(id);

            request.onsuccess = (event)=>{
                resolve(`Deleted id: ${id}`);
            };

            request.onerror = (event)=>{
                reject("Error while Deleting: "+event.target.errorCode);
            };
        });
    });
}

// exports = {addData, getAllData};
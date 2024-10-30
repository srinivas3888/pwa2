// import { addData, getAllData } from './indexeddb';

// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
        .then(register => {
            console.log('Service Worker registered with scope:', register.scope);
        })
        .catch(error => {
            console.log('Service Worker registration failed:', error);
        });
}

// Handle data storage in local storage
document.getElementById('saveButton').addEventListener('click', () => {
    const inp = document.getElementById('inp');
    let data = inp.value;
    inp.value = "";
    if (data === "") {
        data = "Default txt";
    }
    let d = {
        id_time: Date.now(),
        content: data
    };
    // let data = prompt("Enter data: ", "Default txt");
    // 'This data is saved for offline use!';
    addData(d)
        .then(() => { alert('Data saved offline!'); })
        .catch((err) => { alert('Error while saving data into indexedDb : ' + err); })
    // localStorage.setItem('offlineData', data);

});

document.getElementById('loadButton').addEventListener('click', async () => {
    // const data = localStorage.getItem('offlineData');
    let data;
    try {
        data = await getAllData();
    }
    catch (err) {
        data = "Error : " + err;
    }

    console.log(data)

    const displayElement = document.getElementById('dataDisplay');
    if (data) {
        data.map(d => { displayElement.innerHTML += d.content + "<br>" });
    } else {
        displayElement.textContent = 'No data found. Please save some data first.';
    }
});

document.getElementById('deleteButton').addEventListener('click', async () => {
    let data;
    try {
        data = await getAllData();
    }
    catch (err) {
        data = "Error : " + err;
    }

    if (data) {
        const inp = document.getElementById('inp');
        let d = inp.value;
        inp.value = "";
        let id;
        for (let i = 0; i < data.length; i++) {
            if (data[i].content === d) {
                id = data[i].id;
                break;
            }
        }
        // console.log({
        //     id,
        //     data
        // });
        deleteData(id)
            .then((t) => { alert(t) })
            .catch((t) => { alert(t); });
    } else {
        alert('No data found to delete. Please save some data first.');
    }
});

async function subscribeToNotifications() {
    askNotificationPermission();
    console.log("Registering Push...")
    // const registration = await navigator.serviceWorker.ready;
    const publicVapidKey = urlBase64ToUint8Array('BGSiY1tj28LV9bh8jGsvhX_-CUAGuhUqBkxf85ycG9VHmxPg_9nG9amcS7enT9rSnRFYERboAoLEhPZ3JNsn5mc');
    console.log("PublicKey converted to Uint8Array...")

    let subscription;
    try{
        let registration = await navigator.serviceWorker.ready;
        subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicVapidKey // Replace with your VAPID public key
    });
    console.log("Push Registered...");
    }
    catch(err){
        console.log("Error while registering Push : "+err);
    }

    try {
        const r = await fetch('https://pushnotifications-ofer.onrender.com/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('User is subscribed to notifications & Notification Sent...' + r);
    }
    catch (err) {
        console.log("An error occurred while Sending Notification : " + err);
    }
}

//Method for public vapid key conversion...
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// async function sendNotifications() {
//     const r = await fetch('/send-notification', {
//         method: 'POST',
//         body: JSON.stringify({}),
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     });
//     console.log(r);
// }

function askNotificationPermission() {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications.');
        return;
    }

    // Check the current permission status
    if (Notification.permission === 'granted') {
        console.log('User has already granted permission.');
        return;
    }

    if (Notification.permission === 'denied') {
        console.log('User has denied notifications.');
        return;
    }

    // Request permission from the user
    Notification.requestPermission().then(async (permission) => {
        if (permission === 'granted') {
            console.log('User granted permission for notifications.');
            // You can also subscribe the user to push notifications here
            await subscribeToNotifications();
        } else {
            console.log('User denied permission for notifications.');
        }
    }).catch(error => {
        console.error('Error occurred while requesting permission:', error);
    });
}









// self.addEventListener('install', (event) => {
//     if('caches' in window) {
//         caches.keys().then((cacheNames) => {
//             cacheNames.forEach((cacheName) => {
//                 caches.delete(cacheName);
//         });
//     });
//     }
//     event.waitUntil(
//     caches.open(CACHE_NAME)
//         .then(cache => {
//             return cache.addAll(URLS_TO_CACHE);
//         })
//     );
//     self.skipWaiting();
// });
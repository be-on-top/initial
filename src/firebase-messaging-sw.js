// importScripts("https://www.gstatic.com/firebasejs/7.23.0/firebase-app.js");
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// importScripts('https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/9.16.0/firebase-messaging.js');


// import { onBackgroundMessage } from "firebase/messaging/sw";


firebase.initializeApp(
  {
    // apiKey: "AIzaSyAtKNEibUci4ru5bsd2Df1quoFBKIqbL-k",
    // authDomain: "pwa-be-on-top.firebaseapp.com",
    // projectId: "pwa-be-on-top",
    // storageBucket: "pwa-be-on-top.appspot.com",
    // messagingSenderId: "509490429297",
    // appId: "1:509490429297:web:a83ce8c9d1a9de4ff8cad0"

    apiKey: "AIzaSyCSumVFe5c414G6t0NlSp6LIPfXgTs5IEk",
    authDomain: "be-on-top-beta.firebaseapp.com",
    projectId: "be-on-top-beta",
    storageBucket: "be-on-top-beta.appspot.com",
    messagingSenderId: "212539373061",
    appId: "1:212539373061:web:ae37997ebc068516700e6c"
  }
)


const messaging = firebase.messaging();


// pour paramétrer des options de notifications ???? 
// onBackgroundMessage(messaging, (payload) => {
//   console.log('[firebase-messaging-sw.js] Received background message ', payload);
//   const notificationTitle = 'Background Message Title';
//   const notificationOptions = {
//     body: 'Background Message body.',
//     icon: '/firebase-logo.png'
//   };

//   self.registration.showNotification(notificationTitle,
//     notificationOptions);

// });



self.addEventListener('install', (event) => {
  console.log('Service Worker install event:', event);
  alert('Service Worker Install event !!!!')
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activate event:', event);
});

self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  const options = {
    body: event.data.text(),
  };
  event.waitUntil(
    self.registration.showNotification('Push Notification', options)
  );
});




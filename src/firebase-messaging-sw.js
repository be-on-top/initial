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


// Importez firebase.messaging() si nécessaire
const messaging = firebase.messaging();

// Événement d'installation
self.addEventListener('install', (event) => {
  console.log('Service Worker install event:', event);
  self.skipWaiting();
});

// Événement d'activation
self.addEventListener('activate', (event) => {
  console.log('Service Worker activate event:', event);
});

// Événement de réception des notifications push
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Événement de changement d'abonnement aux notifications push (peut être ajouté)
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then((subscription) => {
        console.log('Subscription renewed:', subscription);
      })
  );
});


// // Ajoutez la gestion de onBackgroundMessage ici
// messaging.onBackgroundMessage((payload) => {
//   console.log('Background Message received:', payload);
//   // Vous pouvez personnaliser la gestion du message ici
//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: 'your-icon-url.png', // Ajoutez une URL vers votre icône
//   };

//   return self.registration.showNotification(notificationTitle, notificationOptions);
// });

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


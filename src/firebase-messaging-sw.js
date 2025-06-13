importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyCSumVFe5c414G6t0NlSp6LIPfXgTs5IEk",
  authDomain: "be-on-top-beta.firebaseapp.com",
  projectId: "be-on-top-beta",
  storageBucket: "be-on-top-beta.appspot.com",
  messagingSenderId: "212539373061",
  appId: "1:212539373061:web:ae37997ebc068516700e6c"
});

const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
//   console.log('[firebase-messaging-sw.js] Received background message', payload);

//   const notificationTitle = payload.notification.title || 'Nouvelle notification';
//   const notificationOptions = {
//     body: payload.notification.body || '',
//     icon: '/assets/icons/icon-192x192.png' // ou une autre icône si tu veux
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);

  // N'affiche que si aucune fenêtre n'est visible (donc vrai background)
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    const isAppInForeground = clients.some(client => client.focused || client.visibilityState === 'visible');

    if (!isAppInForeground) {
      const notificationTitle = payload.notification.title || 'Nouvelle notification';
      const notificationOptions = {
        body: payload.notification.body || '',
        icon: '/assets/icons/icon-192x192.png'
      };
      self.registration.showNotification(notificationTitle, notificationOptions);
    }
  });
});


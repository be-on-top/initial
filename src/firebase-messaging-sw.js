// importScripts("https://www.gstatic.com/firebasejs/7.23.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/9.16.0/firebase-messaging.js");
import { onBackgroundMessage } from "firebase/messaging/sw";

firebase.initializeApp(
  {
    apiKey: "AIzaSyAtKNEibUci4ru5bsd2Df1quoFBKIqbL-k",
    authDomain: "pwa-be-on-top.firebaseapp.com",
    projectId: "pwa-be-on-top",
    storageBucket: "pwa-be-on-top.appspot.com",
    messagingSenderId: "509490429297",
    appId: "1:509490429297:web:a83ce8c9d1a9de4ff8cad0"
  }
)


const messaging = firebase.messaging();


// pour paramétrer des options de notifications ???? 
onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here 
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);

});

navigator.serviceWorker.ready.then((reg) => {
  reg.pushManager.getSubscription().then((subscription) => {
    const options = subscription.options;
    console.log(options.applicationServerKey); // the public key
  });
});
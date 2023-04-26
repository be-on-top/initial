importScripts("https://www.gstatic.com/firebasejs/7.23.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/7.23.0/firebase-messaging.js");

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
const messaging= firebase.messaging();
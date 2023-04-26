import { onBackgroundMessage } from 'firebase/messaging/sw'
import { initializeApp, FirebaseOptions } from 'firebase/app'
import { getMessaging, isSupported } from 'firebase/messaging/sw'

// declare let self: ServiceWorkerGlobalScope
// const app = initializeApp(/* firebaseOptions */)

// self.addEventListener('activate', (event) => {
//   event.waitUntil(self.clients.claim())
// })

// isSupported()
//   .then(() => {
//     const messaging = getMessaging(app)

//     onBackgroundMessage(messaging, ({ notification }) => {
//       const { title, body, image } = notification ?? {}

//       if (!title) {
//         return
//       }

//       self.registration.showNotification(title, {
//         body,
//         icon: image
//       })
//     })
//   })
//   .catch(/* error */)

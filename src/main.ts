import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => {
    if ('serviceWorker' in navigator && environment.production) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          reg.update(); // Force la mise à jour
        }
      });
    }
  })
  .catch(err => console.error(err));

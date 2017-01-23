import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

declare let lightReload: any;

if (process.env.ENV === 'production') {
  enableProdMode();
} else {
  require('light-reload/client');
  lightReload.init(9107, { maxReconnectCount: 10 });
}

platformBrowserDynamic().bootstrapModule(AppModule);
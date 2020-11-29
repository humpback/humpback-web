import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

declare let lightReload: any;

if (process.env.ENV === 'production') {
  enableProdMode();
} else {
  require('light-reload/client');
  lightReload.init(process.env.WS_PORT || 9107, { maxReconnectCount: 10, wsUrl: process.env.WS_URL });
}

platformBrowserDynamic().bootstrapModule(AppModule);
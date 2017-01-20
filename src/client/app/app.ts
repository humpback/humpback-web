import { Component } from "@angular/core";
import { AuthService } from './services';

@Component({
  selector: 'humpback-app',
  template: `
    <router-outlet></router-outlet>
  `
})

export class HumpbackApp {
  constructor(private authService: AuthService) {

  }

  ngOnInit() {
    let returnUrl = location.pathname;
    if (!sessionStorage.getItem('hb_returnUrl') && returnUrl.indexOf('/login') === -1) {
      sessionStorage.setItem('hb_returnUrl', returnUrl);
    }
  }
}
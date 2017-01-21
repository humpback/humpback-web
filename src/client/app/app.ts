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
    
  }
}
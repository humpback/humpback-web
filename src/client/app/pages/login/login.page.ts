import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './../../services';
import { IUserLogin } from './../../interfaces';

declare let messager: any;

@Component({
  selector: 'login',
  styleUrls: ['./login.css'],
  templateUrl: './login.html'
})

export class LoginPage {

  private user: IUserLogin;
  private isLogin: boolean;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _authService: AuthService) {

  }

  ngOnInit() {
    this.user = {
      UserID: '',
      Password: '',
      RememberMe: false
    };
  }

  private login(form: any) {
    if (form.invalid) return;
    this.isLogin = true;
    this._authService.login(this.user)
      .then(data => {
        messager.success("Login succeed!");
        this.redirect();
      })
      .catch(err => {
        this.isLogin = false;
        messager.error(err);
      });
  }

  private redirect() {
    let returnUrl = "/";
    if (sessionStorage.getItem('hb_returnUrl')) {
      returnUrl = sessionStorage.getItem('hb_returnUrl');
      sessionStorage.removeItem('hb_returnUrl');
      returnUrl = returnUrl.replace('/#', '');
    }
    this._router.navigateByUrl(returnUrl);
  }
}
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
  private returnUrl: string;

  private subscribers: Array<any> = [];

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
    let paramSub = this._route.params.subscribe(param => {
      this.returnUrl = param['returnUrl'] || '/';
    });
  }

  ngOnDestroy() {
    this.subscribers.forEach((item: any) => item.unsubscribe());
  }

  private login(form: any) {
    if (form.invalid) return;
    this.isLogin = true;
    this._authService.login(this.user)
      .then(data => {
        messager.success("Login succeed!");
        this._router.navigateByUrl(this.returnUrl);
      })
      .catch(err => {
        this.isLogin = false;
        messager.error(err);
      });
  }
}
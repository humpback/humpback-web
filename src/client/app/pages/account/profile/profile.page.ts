import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './../../../services';

declare let messager: any;

@Component({
  selector: 'hb-user-profile',
  templateUrl: './profile.html',
  // styleUrls: ['./profile.css']
})
export class UserProfilePage {

  private userInfo: any;

  constructor(
    private _router: Router,
    private _userService: UserService) {

  }

  ngOnInit() {
    this.getUserInfo();
  }

  private getUserInfo() {
    this._userService.getCurrentUser()
      .then(data => {
        this.userInfo = data;
      })
      .catch(err => {
        messager.error(err);
        this._router.navigate(['/']);
      });
  }

  private updateProfile(form: any) {
    if (form.invalid) return;
    this._userService.updateProfile(this.userInfo)
      .then(data => {
        messager.success('Updated.');
        this.getUserInfo();
      })
      .catch(err => {
        messager.error(err);
      });
  }
}
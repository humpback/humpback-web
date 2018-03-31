import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from './../../../../services';

declare let messager: any;

@Component({
  selector: 'hb-manage-user-edit',
  templateUrl: './user-edit.html',
  styleUrls: ['./user-edit.css']
})
export class ManageUserEditPage {

  private subscribers: Array<any> = [];
  private isNew: boolean = true;

  private userInfo: any = {
    UserID: '',
    FullName: '',
    Password: '',
    Department: '',
    Email: '',
    IsAdmin: false
  };

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService) {

  }

  ngOnInit() {
    let paramSub = this._route.params.subscribe(params => {
      let groupId = params['userId'];
      if (groupId) {
        this.isNew = false;
        this._userService.getById(groupId)
          .then(data => {
            this.userInfo = data;
          })
          .catch(err => {
            messager.error(err);
            this._router.navigate(['/manage', 'users']);
          });
      }
    });
    this.subscribers.push(paramSub);
  }

  private save(form: any) {
    if (form.invalid) return;
    let promis: any;
    if (this.isNew) {
      if (!this.userInfo.Password)
        this.userInfo.Password = '123456';
      promis = this._userService.registry(this.userInfo);
    } else {
      promis = this._userService.updateProfile(this.userInfo);
    }
    promis
      .then((res: any) => {
        messager.success('Succeed.');
        this._router.navigate(['/manage', 'users']);
      })
      .catch((err: any) => {
        messager.error(err);
      });
  }
}

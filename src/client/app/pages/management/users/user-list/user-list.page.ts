import { Component } from '@angular/core';
import { UserService } from './../../../../services';

declare let messager: any;
declare let _: any;

@Component({
  selector: 'hb-manage-user-list',
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class ManageUserListPage {

  private users: Array<any>;

  private searchWord: string;
  private totalCount: number = 0;
  private pageSize: number = 10;
  private pageIndex: number = 1;
  private pageOptions: any;

  private delTarget: any;
  private deleteUserModalOptions: any;

  private resetTarget: any;
  private resetPasswordModalOptions: any;

  constructor(
    private _userService: UserService) {

  }

  ngOnInit() {
    let modalOptions = {
      show: false,
      title: 'WARN',
      hideCloseBtn: true
    };
    this.resetPasswordModalOptions = _.cloneDeep(modalOptions);
    this.deleteUserModalOptions = _.cloneDeep(modalOptions);
    this.pageOptions = {
      "boundaryLinks": false,
      "directionLinks": true,
      "hidenLabel": true
    };
    this.setPage(1);
  }

  private setPage(pageIndex: number) {
    this.pageIndex = pageIndex;
    this._userService.getAll(pageIndex, this.pageSize, this.searchWord)
      .then(data => {
        this.totalCount = data.total_rows;
        this.users = data.rows;
      })
      .catch(err => {
        messager.error(err);
      });
  }

  private search(keyWord: string) {
    this.searchWord = keyWord;
    this.setPage(1);
  }

  private showResetPasswordModal(target: any) {
    this.resetTarget = target;
    this.resetPasswordModalOptions.show = true;
  }

  private resetPassword() {
    if (!this.resetTarget) return;
    this.resetPasswordModalOptions.show = false;
    this._userService.resetPassword(this.resetTarget.UserID)
      .then(res => {
        messager.success('Reset password succeed.');
        this.resetTarget = null;
      })
      .catch(err => {
        messager.error(err);
      });
  }

  private showDeleteModal(target: any) {
    this.delTarget = target;
    this.deleteUserModalOptions.show = true;
  }

  private delUser() {
    if (!this.delTarget) return;
    this.deleteUserModalOptions.show = false;
    this._userService.remove(this.delTarget.UserID)
      .then(res => {
        this.delTarget = null;
        messager.success('Deleted.');
        if (this.users.length === 1 && this.pageIndex > 1) {
          this.pageIndex--;
        }
        this.setPage(this.pageIndex);
      })
      .catch(err => {
        messager.error(err);
      });
  }
}
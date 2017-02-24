import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, GroupService } from './../../../../services';

declare let messager: any;

@Component({
  selector: 'hb-manage-group-list',
  templateUrl: './group-list.html',
  styleUrls: ['./group-list.css']
})
export class ManageGroupListPage {

  private groups: Array<any>;
  private delTarget: any;
  private isAdmin: boolean = false;
  private deleteGroupModalOptions: any = {};

  private filterGroups: Array<any> = [];
  private filterCondition: string;
  private currentGroups: Array<any>;

  private pageSize: number = 10;
  private pageOptions: any;

  constructor(
    private _router: Router,
    private _groupService: GroupService,
    private _authService: AuthService) {

  }

  ngOnInit() {
    this.deleteGroupModalOptions = {
      show: false,
      title: 'WARN',
      hideCloseBtn: true
    };
    this.pageOptions = {
      "boundaryLinks": false,
      "directionLinks": true,
      "hidenLabel": true
    };
    this.groups = [];
    this.getGroups();
    let currentUser = this._authService.getUserInfoFromCache();
    this.isAdmin = currentUser.IsAdmin;    
  }

  private getGroups() {
    this._groupService.getForManage()
      .then(data => {
        this.groups = data;
        this.search(this.filterCondition);
      })
      .catch(err => {
        messager.error(err.message || err);
        this._router.navigate(['/']);
      });
  }

  private searchTimeout: any;
  private search(value?: any) {
    this.filterCondition = value || '';
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      let keyWord = this.filterCondition;
      if (!keyWord) {
        this.filterGroups = this.groups;
      } else {
        let regex = new RegExp(keyWord, 'i');
        this.filterGroups = this.groups.filter(item => {
          return regex.test(item.Name);
        });
      }
      this.setPage(1);
    }, 100);
  }

  private setPage(pageIndex: number) {
    if (!this.filterGroups) return;
    let start = (pageIndex - 1) * this.pageSize;
    let end = start + this.pageSize;
    this.currentGroups = this.filterGroups.slice(start, end);
  }

  private showDeleteModal(group: any) {
    this.delTarget = group;
    this.deleteGroupModalOptions.show = true;
  }

  private delGroup() {
    if (!this.delTarget) return;
    this.deleteGroupModalOptions.show = false;
    this._groupService.remove(this.delTarget.ID)
      .then(res => {
        messager.success('Succeed.');
        this._groupService.clear();
        this.getGroups();
      })
      .catch(err => {
        messager.error(err);
      });
  }
}
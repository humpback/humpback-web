import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService, AuthService } from './../../../../services';

declare let messager: any;

@Component({
  selector: 'hb-manage-group-edit',
  templateUrl: './group-edit.html',
  styleUrls: ['./group-edit.css']
})
export class ManageGroupEditPage {

  private subscribers: Array<any> = [];
  private isNew: boolean = true;

  private groupInfo: any = {
    Name: '',
    Description: '',
    OpenToPublic: false,
    Owners: [],
    Servers: [],
  };

  private users: Array<string> = [];
  private ownerSelect2Options: any;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _groupService: GroupService,
    private _authService: AuthService) {

  }

  ngOnInit() {
    this.ownerSelect2Options = {
      multiple: true,
      closeOnSelect: true,
      minimumInputLength: 2,
      placeholder: 'Select User',
      dropdownAutoWidth: true,
      ajax: {
        url: "/api/users/search",
        dataType: 'json',
        delay: 250,
        data: function (params: any) {
          return {
            q: params.term
          };
        },
        processResults: function (data: any, params: any) {
          return {
            results: data.map((item: any) => {
              return { "text": item.FullName, "id": item.UserID };
            })
          };
        },
        cache: true
      },
      formatSelection: function (item: any) {
        if (!item) return;
        return `${item.UserId} - ${item.FullName}`;
      }
    };
    let currentUser = this._authService.getUserInfoFromCache();
    this.groupInfo.Owners.push(currentUser.UserID);
    let paramSub = this._route.params.subscribe(params => {
      let groupId = params['groupId'];
      if (groupId) {
        this.isNew = false;
        this._groupService.getById(groupId)
          .then(data => {
            this.groupInfo = data;
          })
          .catch(err => {
            messager.error(err);
            this._router.navigate(['/manage', 'groups']);
          });
      }
    });
    this.subscribers.push(paramSub);
  }

  ngOnDestroy() {
    this.subscribers.forEach((item: any) => item.unsubscribe());
  }

  private refreshSelectedUser(data: any) {
    this.groupInfo.Owners = data.value || [];
  }

  private save(form: any) {
    if (form.invalid) return;
    if (!this.groupInfo.Owners || this.groupInfo.Owners.length == 0) return;
    let promise: any;
    if (this.isNew) {
      promise = this._groupService.add(this.groupInfo);
    } else {
      promise = this._groupService.update(this.groupInfo);
    }
    promise
      .then((res: any) => {
        messager.success('Succeed.');
        this._groupService.clear();
        this._router.navigate(['/manage', 'groups']);
      })
      .catch((err: any) => {
        messager.error(err);
      })
  }
}
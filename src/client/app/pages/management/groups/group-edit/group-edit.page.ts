import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { GroupService, AuthService, SystemConfigService } from './../../../../services';

declare let messager: any;

@Component({
  selector: 'hb-manage-group-edit',
  templateUrl: './group-edit.html'
})
export class ManageGroupEditPage {

  private subscribers: Array<any> = [];
  private isNew: boolean = true;
  private serverForm: FormGroup;
  private submitted: boolean;

  private groupInfo: any = {
    Name: '',
    Description: '',
    OpenToPublic: false,
    ContactInfo: '',
    IsCluster: false,
    IsRemoveDelay: true,
    Owners: [],
    Servers: [],
  };

  private users: Array<string> = [];
  private ownerSelect2Options: any;
  private systemConfig: any = {};

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _groupService: GroupService,
    private _authService: AuthService,
    private _systemConfigService: SystemConfigService,
    private _fb: FormBuilder) {

  }

  ngOnInit() {
    this.systemConfig = this._systemConfigService.Config;
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
            this.buildForm();
          })
          .catch(err => {
            messager.error(err);
            this._router.navigate(['/manage', 'groups']);
          });
      } else {
        this.buildForm();
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

  private buildForm() {
    this.submitted = false;
    let data = this.groupInfo || {};
    this.serverForm = this._fb.group({
      Name: data.Name || '',
      Description: data.Description || '',
      OpenToPublic: data.OpenToPublic === true ? true : false,
      IsCluster: data.IsCluster === true ? true : false,
      IsRemoveDelay: (data.IsRemoveDelay === true ||  data.IsRemoveDelay === undefined) ? true : false,
      Servers: this._fb.array([]),
      ContactInfo: data.ContactInfo || ''
    });
    if (data.Servers && data.Servers.length > 0) {
      for (let server of data.Servers) {
        this.addServer(server.Name, server.IP);
      }
    }
  }

  private addServer(name?: string, ip?: string) {
    let control = <FormArray>this.serverForm.controls['Servers'];
    let serverCtrl = this._fb.group({
      "Name": name || '',
      "IP": ip || ''
    });
    control.push(serverCtrl);
  }

  private removeServer(index: number) {
    let control = <FormArray>this.serverForm.controls['Servers'];
    control.removeAt(index);
  }

  private save() {
    this.submitted = true;
    let form = this.serverForm;
    if (form.invalid) return;
    let groupInfo = form.value;
    let invalidSrvers = groupInfo.Servers.filter((item: any) => {
      return !item.Name && !item.IP;
    });
    if (invalidSrvers.length > 0) return;
    if (!this.groupInfo.Owners || this.groupInfo.Owners.length == 0) return;
    let promise: any;
    let postData: any = {
      Name: form.value.Name,
      Description: form.value.Description,
      OpenToPublic: !!form.value.OpenToPublic,
      IsCluster: !!form.value.IsCluster,
      IsRemoveDelay: !! form.value.IsRemoveDelay || !!! form.value.IsCluster,
      Owners: this.groupInfo.Owners || [],
      Servers: form.value.Servers,
      ContactInfo: form.value.ContactInfo
    };
    if (this.isNew) {
      promise = this._groupService.add(postData);
    } else {
      postData.ID = this.groupInfo.ID;
      promise = this._groupService.update(postData);
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

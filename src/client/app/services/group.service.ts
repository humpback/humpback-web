import { Injectable, Inject } from '@angular/core';
import { AuthService } from './auth.service';
import { CusHttpService } from './custom-http.service';
import { SystemConfigService } from './system-config.service';

declare let _: any;

@Injectable()
export class GroupService {

  private systemConfig: any;
  private groups: any = {};
  private baseUrl: string;

  constructor(
    private _http: CusHttpService,
    private _authService: AuthService,
    private _systemConfigService: SystemConfigService) {
    this.baseUrl = '/api/groups';
    this._systemConfigService.ConfigSubject.forEach(data => {
      this.systemConfig = data;
    })
  }

  get(nocache: boolean = false, type: string = 'normal'): Promise<any> {
    if (this.groups[type] && this.groups[type].length > 0 && !nocache) {
      return Promise.resolve(_.cloneDeep(this.groups[type]));
    }
    let url = `${this.baseUrl}?type=${type}`;
    return new Promise((resolve, reject) => {
      this._http.get(url)
        .then(res => {
          let groups = res.json() || [];
          this.groups[type] = groups;
          resolve(groups);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  getForManage(): Promise<any> {
    let url = `${this.baseUrl}?formanage=1`;
    return new Promise((resolve, reject) => {
      this._http.get(url)
        .then(res => {
          this.groups = res.json();
          resolve(this.groups);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  getBasicGroupsInfo(): Promise<any> {
    let url = `${this.baseUrl}/getbasicgroupsinfo`;
    return new Promise((resolve, reject) => {
      this._http.get(url)
        .then(res => {
          let groups = res.json();
          resolve(groups);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  getById(id: string): Promise<any> {
    let url = `${this.baseUrl}/${id}`;
    return new Promise((resolve, reject) => {
      this._http.get(url)
        .then(res => {
          let group = res.json();
          resolve(group);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        })
    })
  }

  add(group: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._http.post(this.baseUrl, group)
        .then(res => {
          let data = res.json();
          this.notifyCenter(data.ID, 'create');
          resolve(data);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  update(group: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._http.put(this.baseUrl, group)
        .then(res => {
          this.notifyCenter(group.ID, 'change');
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  remove(id: string): Promise<any> {
    let url = `${this.baseUrl}/${id}`;
    return new Promise((resolve, reject) => {
      this._http.delete(url)
        .then(res => {
          this.notifyCenter(id, 'remove');
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  isIPEnableProxy(ip: string): boolean {
    // TODO: Access humpback agent through proxy program
    return false;
  }

  clear(): void {
    this.groups = {};
  }

  private notifyCenter(groupId: string, event: string) {
    if (!this.systemConfig.EnableClusterMode) return;
    let url = `${this.systemConfig.HumpbackCenterAPI}/v1/groups/event`;
    let body = {
      GroupID: groupId,
      Event: event
    };
    this._http.post(url, body)
      .then(res => {

      })
      .catch(err => { });
  }
}

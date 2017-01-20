import { Injectable, Inject } from '@angular/core';
import { AppConfig } from './../app.config';
import { AuthService } from './auth.service';
import { CusHttpService } from './custom-http.service';

declare let _: any;

@Injectable()
export class GroupService {

  private groups: Array<any>;
  private useProxyIps: Array<string> = [];
  private url: string;
  private headers: any;

  constructor(
    private http: CusHttpService,
    private authService: AuthService) {
    this.url = `${AppConfig.HumpbackAPI}/api/groups`;
    this.headers = {
      'Accept': 'application/json'
    }
  }

  get(): Promise<any> {
    if (this.groups && this.groups.length !== 0) {
      return Promise.resolve(this.groups);
    }
    let url = this.url;
    return new Promise((resolve, reject) => {
      this.http
        .get(url, { headers: this.headers })
        .then(res => {
          this.useProxyIps = [];
          this.groups = res.json();
          this.groups = _.orderBy(this.groups, ['Name']);
          this.groups.forEach((item) => {
            item.Servers.sort();
            item.RegistryLocation = item.RegistryLocation || 'gdev';
            if (item.UseProxy === true) {
              this.useProxyIps = this.useProxyIps.concat(item.Servers || []);
            }
          });
          resolve(this.groups);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  getById(id: string): Promise<any> {
    let url = `${this.url}/${id}`;
    if (this.groups !== null && this.groups !== undefined) {
      let group = _.find(this.groups, (item: any) => {
        return item.ID === id;
      });
      if (group) {
        return Promise.resolve(group);
      }
    }
    return new Promise((resolve, reject) => {
      this.http
        .get(url, { headers: this.headers })
        .then(res => {
          let group = res.json();
          group.Servers.sort();
          group.RegistryLocation = group.RegistryLocation || 'gdev';
          resolve(group);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        })
    })
  }

  create(group: any): Promise<any> {
    let url = this.url;
    return new Promise((resolve, reject) => {
      this.http
        .post(url, group, { headers: this.headers })
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        })
    })
  }

  add(group: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(this.url, group, { headers: this.headers })
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  update(group: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.put(this.url, group, { headers: this.headers })
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  remove(id: string): Promise<any> {
    let url = `${this.url}/${id}`;
    return new Promise((resolve, reject) => {
      this.http
        .delete(url, { headers: this.headers })
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  isIPEnableProxy(ip: string): boolean {
    return this.useProxyIps.indexOf(ip) !== -1;
  }

  clear(): void {
    this.groups = null;
  }
}
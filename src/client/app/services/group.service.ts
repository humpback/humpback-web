import { Injectable, Inject } from '@angular/core';
import { AppConfig } from './../app.config';
import { AuthService } from './auth.service';
import { CusHttpService } from './custom-http.service';

declare let _: any;

@Injectable()
export class GroupService {

  private groups: Array<any>;
  private url: string;

  constructor(
    private http: CusHttpService,
    private authService: AuthService) {
    this.url = `${AppConfig.HumpbackAPI}/api/groups`;
  }

  get(nocache: boolean = false): Promise<any> {
    if (this.groups && this.groups.length !== 0 && !nocache) {
      return Promise.resolve(this.groups);
    }
    let url = this.url;
    return new Promise((resolve, reject) => {
      this.http.get(url)
        .then(res => {
          this.groups = res.json();
          resolve(this.groups);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  getForManage(): Promise<any> {
    let url = `${this.url}?formanage=1`;
    return new Promise((resolve, reject) => {
      this.http.get(url)
        .then(res => {
          this.groups = res.json();
          resolve(this.groups);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  getById(id: string): Promise<any> {
    let url = `${this.url}/${id}`;
    return new Promise((resolve, reject) => {
      this.http.get(url)
        .then(res => {
          let group = res.json();
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
      this.http.post(url, group)
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
      this.http.post(this.url, group)
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
      this.http.put(this.url, group)
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
      this.http.delete(url)
        .then(res => {
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
    this.groups = null;
  }
}
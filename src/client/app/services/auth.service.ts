import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { EventNotifyService, EventType } from './event-notify.service';
import { CusHttpService } from './custom-http.service';
import { IUserLogin } from './../interfaces';

@Injectable()
export class AuthService {

  private userInfo: any = null;

  constructor(
    private http: CusHttpService,
    private eventNotify: EventNotifyService) {

  }

  login(userInfo: IUserLogin): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `/api/users/login`;
      this.http.post(url, userInfo)
        .then(res => {
          this.userInfo = res.json();
          this.eventNotify.notifyDataChanged(EventType.UserInfoChanged, this.userInfo);
          resolve(this.userInfo);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  isLogin(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `/api/users/islogin`;
      if (this.userInfo) {
        return resolve(this.userInfo);
      }
      this.http.get(url)
        .then(res => {
          let result = res.json();
          if (!result.IsLogin) {
            return resolve(this.userInfo);
          }
          this.userInfo = result.UserInfo;
          this.eventNotify.notifyDataChanged(EventType.UserInfoChanged, this.userInfo);
          resolve(this.userInfo);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  logout(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `/api/users/logout`;
      this.http.get(url)
        .then(res => {
          this.clearUserInfo();
          resolve(true);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        })
    });
  }

  getUserInfoFromCache(): any {
    return this.userInfo;
  }

  clearUserInfo() {
    this.userInfo = null;
    this.eventNotify.notifyDataChanged(EventType.UserInfoChanged, this.userInfo);
  }
}

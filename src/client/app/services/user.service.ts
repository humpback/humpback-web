import { Injectable } from '@angular/core';
import { CusHttpService } from './custom-http.service';
import { AppConfig } from './../app.config';

@Injectable()
export class UserService {

  constructor(
    private _http: CusHttpService) {

  }

  getCurrentUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${AppConfig.HumpbackAPI}/api/users/current-user`;
      this._http.get(url)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  getAll(pageIndex: number, pageSize: number = 10, search?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${AppConfig.HumpbackAPI}/api/users?pageIndex=${pageIndex}&pageSize=${pageSize}&t=${new Date().valueOf()}`;
      if (search) {
        url = `${url}&q=${search}`;
      }
      this._http.get(url)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  getById(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${AppConfig.HumpbackAPI}/api/users/${userId}`;
      this._http.get(url)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  registry(userInfo: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${AppConfig.HumpbackAPI}/api/users/register`;
      this._http.post(url, userInfo)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  updateProfile(profile: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${AppConfig.HumpbackAPI}/api/users/${profile.UserID}`;
      this._http.put(url, profile)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = {
        UserID: userId,
        OldPassword: oldPassword,
        NewPassword: newPassword
      }
      let url = `${AppConfig.HumpbackAPI}/api/users/change-password`;
      this._http.put(url, body)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  resetPassword(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = {
        UserID: userId
      }
      let url = `${AppConfig.HumpbackAPI}/api/users/reset-password`;
      this._http.put(url, body)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  remove(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${AppConfig.HumpbackAPI}/api/users/${userId}`;
      this._http.delete(url)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }
}
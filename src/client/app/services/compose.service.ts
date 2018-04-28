import { Injectable, Inject } from '@angular/core';
import { AuthService } from './auth.service';
import { CusHttpService } from './custom-http.service';
import { GroupService } from './group.service';

declare let _: any;

@Injectable()
export class ComposeService {

  private systemConfig: any;
  private groups: any = {};
  private baseUrl: string;

  constructor(
    private _http: CusHttpService,
    private _groupService: GroupService,
    private _authService: AuthService) {

  }

  private buildReq(ip: string, hidenLoading: boolean = false): any {
    let useProxy: boolean = this._groupService.isIPEnableProxy(ip);
    let options: any = {
      disableLoading: hidenLoading,
      timeout: 1 * 60 * 1000
    };
    if (useProxy) {
      options.headers = {
        'x-proxy-ip': ip
      };
    }
    let url: string = `http://${ip}:8500/dockerapi/v2`;
    let req = {
      url: url,
      options: options
    }
    return req;
  }

  getService(ip: string, hidenLoading: boolean = false): Promise<any> {
    let reqConfig = this.buildReq(ip, hidenLoading);
    let url: string = `${reqConfig.url}/services`;
    return new Promise((resolve, reject) => {
      this._http.get(url, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          let errData = JSON.parse(JSON.stringify(err));
          reject(errData.json ? errData.json() : errData);
        });
    });
  }

  getServiceByOne(ip: string, name: any, hidenLoading: boolean = false): Promise<any> {
    let reqConfig = this.buildReq(ip, hidenLoading);
    let url: string = `${reqConfig.url}/services/${name}`;
    return new Promise((resolve, reject) => {
      this._http.get(url, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  addCompose(ip: string, data: any): Promise<any>{
    let reqConfig = this.buildReq(ip);
    let url: string = `${reqConfig.url}/services`;
    return new Promise((resolve, reject) => {
      this._http.post(url, data)
      .then((res) => {
        resolve(res);
      })
      .catch(err => {
        reject(err.json ? err.json() : err);
      });
    })
  }

  ComposeOperate(ip: string, name: string, action: string): Promise<any> {
    let reqConfig = this.buildReq(ip, false);
    let url: string = `${reqConfig.url}/services`;
    let data = {
      Name: name,
      Action: action,
    };
    return new Promise((resolve, reject) => {
      this._http.put(url, data, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }
}

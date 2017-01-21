import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';
import { CusHttpService } from './custom-http.service';
import { GroupService } from './group.service';

@Injectable()
export class ImageService {

  private headers: any;

  constructor(
    private http: CusHttpService,
    private authService: AuthService,
    private groupService: GroupService) {
    this.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  private buildReq(ip: string, hidenLoading: boolean = false): any {
    let useProxy: boolean = this.groupService.isIPEnableProxy(ip);
    let options: any = {
      disableLoading: hidenLoading
    };
    if (useProxy) {
      options.headers = {
        'x-proxy-ip': ip
      };
    }
    let url: string = `http://${ip}:8500/v1`;
    let req = {
      url: url,
      options: options
    }
    return req;
  }

  getImages(ip: string): Promise<any> {
    let reqConfig = this.buildReq(ip, false);
    let url: string = `${reqConfig.url}/images`;
    return new Promise((resolve, reject) => {
      this.http.get(url, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  pullImage(ip: string, image: string, hidenLoading: boolean = false): Promise<any> {
    let reqConfig = this.buildReq(ip, hidenLoading);
    let url: string = `${reqConfig.url}/images`;
    let reqBody = {
      'image': image
    };
    return new Promise((resolve, reject) => {
      this.http.post(url, reqBody, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  deleteImage(ip: string, id: string): Promise<any> {
    let reqConfig = this.buildReq(ip, false);
    let url: string = `${reqConfig.url}/images/${id}`;
    return new Promise((resolve, reject) => {
      this.http.delete(url, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  getImageInfoFromDB(name: string): Promise<any> {
    let url = `/api/images/${encodeURIComponent(name)}`;
    return new Promise((resolve, reject) => {
      this.http.get(url, { headers: this.headers })
        .then(res => {
          let data = res.json();
          resolve(data);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        })
    });
  }

  saveImageInfoToDB(info: any): Promise<any> {
    let url = `/api/images`;
    return new Promise((resolve, reject) => {
      this.http.post(url, info, { headers: this.headers })
        .then(res => {
          let data = res.json();
          resolve(data);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        })
    });
  }
}
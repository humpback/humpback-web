import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { CusHttpService } from './custom-http.service';

declare let _: any;

@Injectable()
export class SystemConfigService {

  private baseUrl: string;

  ConfigSubject = new ReplaySubject<any>(1);

  get Config(): any {
    return this._config;
  }
  set Config(value: any) {
    this._config = value;
    this.ConfigSubject.next(this._config);    
  }
  private _config: any;

  constructor(
    private _http: CusHttpService) {
    this.baseUrl = `/api/system-config`;
  }

  get(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.Config) {
        return resolve(this.Config);
      }
      this._http.get(this.baseUrl)
        .then(res => {
          let config = res.json();
          this.Config = config;
          resolve(config);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        })
    });
  }

  save(config: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._http.put(this.baseUrl, config)
        .then(res => {
          this.Config = _.cloneDeep(config);
          let data = res.json();
          resolve(data);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        })
    });
  }
}
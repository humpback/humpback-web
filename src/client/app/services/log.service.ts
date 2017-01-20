import { Injectable } from '@angular/core';
import { AppConfig } from './../app.config';
import { AuthService } from './auth.service';
import { CusHttpService } from './custom-http.service';

@Injectable()
export class LogService {

  private url: string;
  private headers: any;

  constructor(
    private http: CusHttpService,
    private authService: AuthService
  ) {
    this.url = `${AppConfig.HumpbackAPI}/api/logs`;
    this.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  public addLog(content: string, type: string, group: string = "", server: string = ""): void {
    let log = {
      Group: group,
      Server: server,
      Type: type,
      Content: content
    };
    this.http.post(this.url, log, {
      headers: this.headers,
      disableLoading: true
    })
  }

  public getLog(type: string, pageSize: number, pageIndex: number, group: string = "", server: string = ""): Promise<any> {
    let query = `pageSize=${pageSize}&pageIndex=${pageIndex}&Type=${type}&Group=${group}&Server=${server}&t=${Date.now()}`;
    let url = `${this.url}?${query}`;
    return new Promise((resolve, reject) => {
      this.http.get(url, { headers: this.headers })
        .then(res => {
          var logs = res.json();
          resolve(logs);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }
}
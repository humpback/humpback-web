import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { CusHttpService } from './custom-http.service';

@Injectable()
export class LogService {

  private baseUrl: string;

  constructor(
    private http: CusHttpService,
    private authService: AuthService
  ) {
    this.baseUrl = '/api/logs';
  }

  public addLog(content: string, type: string, group: string = "", server: string = ""): void {
    let log = {
      Group: group,
      Server: server,
      Type: type,
      Content: content
    };
    this.http.post(this.baseUrl, log, { disableLoading: true })
      .then(res => {

      })
      .catch(err => {
        console.log('Add log error', err);
      });
  }

  public getLog(type: string, pageSize: number, pageIndex: number, group: string = "", server: string = ""): Promise<any> {
    let query = `pageSize=${pageSize}&pageIndex=${pageIndex}&Type=${type}&Group=${group}&Server=${server}&t=${Date.now()}`;
    let url = `${this.baseUrl}?${query}`;
    return new Promise((resolve, reject) => {
      this.http.get(url)
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
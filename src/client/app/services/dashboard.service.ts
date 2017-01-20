import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { AppConfig } from './../app.config';
import { AuthService } from './auth.service';
import { CusHttpService } from './custom-http.service';

@Injectable()
export class DashboardService {

  private url: string;
  private headers: any;
  constructor(private http: CusHttpService, private authService: AuthService) {
    this.url = `${AppConfig.HumpbackAPI}/api/dashboard`;
    this.headers = {
      'Accept': 'application/json'
    }
  }

  get(): Promise<any> {
    let url = this.url;
    return new Promise((resolve, reject) => {
      this.http.get(url, { headers: this.headers })
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

}
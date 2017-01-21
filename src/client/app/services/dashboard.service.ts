import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { AuthService } from './auth.service';
import { CusHttpService } from './custom-http.service';

@Injectable()
export class DashboardService {

  private url: string;

  constructor(private http: CusHttpService, private authService: AuthService) {
    this.url = '/api/dashboard';
  }

  get(): Promise<any> {
    let url = this.url;
    return new Promise((resolve, reject) => {
      this.http.get(url)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

}
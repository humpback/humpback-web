import { Injectable } from '@angular/core';
import { AppConfig } from './../app.config';
import { Observable } from 'rxjs/Observable';
import { CusHttpService } from './custom-http.service';

@Injectable()
export class HubService {

  constructor(
    private http: CusHttpService) {

  }

  private genURL(location?: string) {
    return `${AppConfig.PrivateRegistryAddress}/v2`;
  }

  getImages(location: string): Promise<any> {
    let url = this.genURL(location);
    url = `${url}/_catalog?n=1000`;
    return new Promise((resolve, reject) => {
      this.http.get(url)
        .then(res => {
          let resBody = res.json ? res.json() : {};
          let result = location === 'gdev' ? resBody.repositories : resBody.data.repositories;
          resolve(result || []);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  getTags(location: string, imageName: string, hidenLoading: boolean = false): Promise<any> {
    let url = this.genURL(location);
    url = `${url}/${imageName}/tags/list`;
    return new Promise((resolve, reject) => {
      this.http
        .get(url, { disableLoading: hidenLoading })
        .then(res => {
          let tags: Array<any> = [];
          if (res.text()) {
            let resBody = res.json();
            tags = resBody.tags.sort().reverse();
          }
          resolve(tags);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }
}
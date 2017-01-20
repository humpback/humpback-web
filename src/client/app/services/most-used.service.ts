import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

declare let _: any;

@Injectable()
export class MostUsedService {

  private userId: string;
  constructor(authService: AuthService) {
    let currentUser = authService.getUserInfoFromCache();
    this.userId = currentUser.UserID;
  }

  get(): any {
    let data = localStorage.getItem(`${this.userId}_servers`);
    if (data) {
      return JSON.parse(data);
    } else {
      return [];
    }
  }

  add(server: string, groupId: string) {
    let serverList = this.get();
    let exist = false;
    for (let item of serverList) {
      if (item.ip === server) {
        exist = true;
        item.count++;
        break;
      }
    }
    if (!exist) {
      serverList.push({
        ip: server,
        groupId: groupId,
        count: 1
      });
    }
    serverList = _.sortBy(serverList, 'count');
    if (serverList.length > 10) {
      serverList = serverList.splice(0, 10);
    }
    localStorage.setItem(`${this.userId}_servers`, JSON.stringify(serverList));
  }
}
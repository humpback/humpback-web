import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { GroupService } from './../services';

@Injectable()
export class GroupResolve implements Resolve<any> {

  constructor(private groupService: GroupService) { }

  resolve(route: ActivatedRouteSnapshot) {
    return this.groupService.get(true);
  }
}
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { SystemConfigService } from './../services';

@Injectable()
export class SystemConfigResolve implements Resolve<any> {

  constructor(
    private _systemConfigService: SystemConfigService) {

  }

  resolve(route: ActivatedRouteSnapshot) {
    return this._systemConfigService.get();
  }
}
import { Injectable } from '@angular/core';
import { Router, CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { GroupService } from './group.service';

@Injectable()
export class IsLogin implements CanActivate {
  constructor(
    private _router: Router,
    private _authService: AuthService) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._authService.isLogin()
        .then(result => {
          if (!result) {
            this._router.navigate(['/login', { returnUrl: state.url }]);
            return resolve(false);
          }
          if (route.data['Admin'] && !result.IsAdmin) {
            this._router.navigate(['/401']);
            return resolve(false);
          }
          resolve(true);
        })
        .catch(err => {
          this._router.navigate(['/401']);
          resolve(false);
        });
    });
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._authService.isLogin()
        .then(result => {
          if (!result) {
            this._router.navigate(['/login', { returnUrl: state.url }]);
            return resolve(false);
          }
          if (route.data['Admin'] && !result.IsAdmin) {
            this._router.navigate(['/401']);
            return resolve(false);
          }
          resolve(true);
        })
        .catch(err => {
          this._router.navigate(['/401']);
          resolve(false);
        });
    });
  }
}

@Injectable()
export class IsGroupOwner implements CanActivateChild {
  constructor(
    private _router: Router,
    private _groupService: GroupService) {

  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    let groupId = route.params['groupId'];
    return new Promise((resolve, reject) => {
      let type = route.data['GroupType'] || route.parent.data['GroupType'] || 'normal';
      this._groupService.get(false, type)
        .then(data => {
          data = data || [];
          let groupIds = data.map((item: any) => item.ID);
          if (groupIds.indexOf(groupId) === -1) {
            this._router.navigate(['/401']);
            resolve(false);
          } else {
            resolve(true);
          }
        })
        .catch(err => {
          console.log('IsGroupOwner', err);
          resolve(false);
        });
    });
  }
}

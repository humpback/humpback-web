import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SystemConfigService } from './../../../services';

declare let _: any;
declare let messager: any;

@Component({
  selector: 'hb-system-config',
  templateUrl: './system-config.html',
  styleUrls: ['./system-config.css']
})
export class SystemConfigPage {

  private config: any = {};

  constructor(
    private _router: Router,
    private _systemConfig: SystemConfigService) {

  }

  ngOnInit() {
    this._systemConfig.get()
      .then(data => {
        this.config = _.cloneDeep(data);
      })
      .catch(err => {
        messager.error(err);
        this._router.navigate(['/']);
      });
  }

  private enablePrivateRegistryChange(value: any) {
    this.config.EnablePrivateRegistry = value;
    if (!value) {
      this.config.PrivateRegistry = '';
    }
  }

  private save(form: any) {
    if (this.config.EnablePrivateRegistry && form.controls.privateRegistry.invalid) return;
    if (this.config.EnableClusterMode && form.controls.humpbackCenterAPI.invalid) return;
    this._systemConfig.save(this.config)
      .then(res => {
        messager.success('Updated.');
      })
      .catch(err => {
        messager.error(err);
      });
  }
}

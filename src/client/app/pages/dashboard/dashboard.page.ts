import { Component } from '@angular/core';
import { DashboardService, LogService, MostUsedService, SystemConfigService } from './../../services';

@Component({
  selector: 'dashboard',
  styleUrls: ['./dashboard.css'],
  templateUrl: './dashboard.html'
})

export class DashboardPage {

  private dashboardInfo: any = {};
  private logs: Array<any>;
  private mostUsedServers: Array<any>;
  private systemConfig: any;

  private subscribers: Array<any> = [];
  constructor(
    private _dashboardService: DashboardService,
    private _logService: LogService,
    private _mostUsedService: MostUsedService,
    private _systemConfigService: SystemConfigService) {

  }

  ngOnInit() {
    let systemSubscriber = this._systemConfigService.ConfigSubject.subscribe(data => {
      this.systemConfig = data;
    });
    this.subscribers.push(systemSubscriber);
    this._logService.getLog('', 10, 1).then((data) => {
      this.logs = data.rows;
    }).catch((err) => {
      console.error('Get top logs error', err);
    });

    this.mostUsedServers = this._mostUsedService.get();
  }

  ngOnDestroy() {
    this.subscribers.forEach((item: any) => item.unsubscribe());
  }
}
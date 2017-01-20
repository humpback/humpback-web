import { Component } from '@angular/core';
import { DashboardService, LogService, MostUsedService } from './../../services';

@Component({
  selector: 'dashboard',
  styleUrls: ['./dashboard.css'],
  templateUrl: './dashboard.html'
})

export class DashboardPage {

  private dashboardInfo: any = {};
  private logs: Array<any>;
  private mostUsedServers: Array<any>;
  constructor(
    private _dashboardService: DashboardService,
    private _logService: LogService,
    private _mostUsedService: MostUsedService) {

  }

  ngOnInit() {
    this._logService.getLog('', 10, 1).then((data) => {
      this.logs = data.rows;
    }).catch((err) => {
      console.error('Get top logs error', err);
    });
    
    this.mostUsedServers = this._mostUsedService.get();
  }
}
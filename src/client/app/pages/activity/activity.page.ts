import { Component } from '@angular/core';
import { GroupService, LogService } from './../../services';

declare let _: any;
declare let messager: any;

@Component({
  selector: 'hb-activity',
  templateUrl: './activity.html',
  styleUrls: ['./activity.css']
})
export class ActivityPage {

  private groups: Array<any> = [];
  private servers: Array<any> = [];
  private logs: Array<any> = [];

  private selectedGroupId: string = '';
  private selectedServer: string = '';
  private selectedType: string = '';

  private pageOptions: any;
  private pageSize: number = 20;
  private totalCount: number;

  constructor(
    private _groupService: GroupService,
    private _logService: LogService) {

  }

  ngOnInit() {
    this.pageOptions = {
      "boundaryLinks": false,
      "directionLinks": true,
      "hidenLabel": true
    };

    this._groupService.get()
      .then(data => {
        this.groups = data;
      })
      .catch(err => {
        messager.error(err.message || 'Get group info failed.');
      });

    this.setPage(1);
  }

  private getLogs(pageIndex: number) {
    let group = this.selectedGroupId ? (this.selectedGroupId === 'All' ? '' : this.selectedGroupId) : '';
    let type = this.selectedType ? (this.selectedType === 'All' ? '' : this.selectedType) : '';
    let server = '';
    this._logService.getLog(type, this.pageSize, pageIndex, group, server)
      .then(data => {
        this.totalCount = data.total_rows;
        this.logs = data.rows;
      })
      .catch(err => {
        messager.error(err.message || 'Get logs info failed.');
      });
  }

  private selectedGroupChange(value: any) {
    this.selectedGroupId = value || '';
    this.setPage(1);
  }

  private selectedTypeChange(value: any) {
    this.selectedType = value || '';
    this.setPage(1);
  }

  private search() {
    this.setPage(1);
  }

  private setPage(pageIndex: number) {
    this.getLogs(pageIndex);
  }
}

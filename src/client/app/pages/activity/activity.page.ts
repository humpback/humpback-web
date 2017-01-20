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
        this.groups = JSON.parse(JSON.stringify(data));
        let allGroup: any = {
          ID: 'All',
          Name: 'All',
          Servers: []
        };
        this.groups.splice(0, 0, allGroup);
        this.groups.forEach((group) => {
          group.Servers.splice(0, 0, 'All');
        });
      })
      .catch(err => {
        messager.error(err.message || 'Get group info failed.');
      });

    this.setPage(1);
  }

  private getLogs(pageIndex: number) {
    let group = this.selectedGroupId ? (this.selectedGroupId === 'All' ? '' : this.selectedGroupId) : '';
    let type = this.selectedType ? (this.selectedType === 'All' ? '' : this.selectedType) : '';
    let server = this.selectedServer ? (this.selectedServer === 'All' ? '' : this.selectedServer) : '';
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
    if (!value) return;
    this.selectedGroupId = value;
    let selectedGroup = _.find(this.groups, (item: any) => {
      return item.ID === value;
    });
    this.servers = selectedGroup.Servers || [];
    this.selectedServer = '';
  }

  private selectedServerChange(value: any) {
    if (!value) return;
    this.selectedServer = value;
    this.setPage(1);
  }

  private selectedTypeChange(value: any) {
    if (!value) return;
    this.selectedType = value;
    this.setPage(1);
  }

  private search() {
    this.setPage(1);
  }

  private setPage(pageIndex: number) {

    if (pageIndex === 6) {
      console.trace();
    }
    this.getLogs(pageIndex);
  }
}
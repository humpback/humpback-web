import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService, ContainerService } from './../../../services';

declare let echarts: any;
declare let messager: any;

@Component({
  selector: 'hb-group-overview',
  templateUrl: './overview.html',
  styleUrls: ['./overview.css']
})
export class GroupOverviewPage {

  @ViewChild('chartPanel')
  private chartPanel: ElementRef;

  private groupInfo: any;
  private servers: Array<any>;
  private chart: any;
  private viewInited: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _groupService: GroupService,
    private _containerService: ContainerService) {

  }

  ngOnInit() {
    this._route.params.forEach(params => {
      if (this.chart) {
        this.chart.clear();
      }
      this.servers = null;
      let groupId = params['groupId'];
      this._groupService.getById(groupId)
        .then(data => {
          this.groupInfo = data;
          let promiseArray = [];
          if (!data.Servers || data.Servers.length === 0) {
            return;
          }
          for (let item of data.Servers) {
            let ip = item.IP || item.Name;
            let temp: any = {
              ip: item.IP,
              name: item.Name,
              isLoading: true,
              running: [],
              stoped: []
            };
            let tempPromis = this._containerService.get(ip)
              .then((data) => {
                data.forEach((container: any) => {
                  let name = container.Names[0].replace(/\//g, "");
                  if (container.Status != undefined && container.Status.indexOf("Up") !== -1) {
                    temp.running.push(name);
                  } else {
                    temp.stoped.push(name);
                  }
                });
                temp.isLoading = false;
                return temp;
              })
              .catch((err) => {
                temp.errMsg = err.message || JSON.stringify(err);
                return temp;
              });
            promiseArray.push(tempPromis);
          }
          Promise.all(promiseArray)
            .then(data => {
              this.servers = data;
              this.updateChart();
            })
            .catch(err => {
              messager.error(err);
              this._router.navigate(['/group']);
            });
        })
        .catch(err => {
          messager.error(err);
          this._router.navigate(['/group']);
        })
    });
  }

  ngAfterViewInit() {
    this.viewInited = true;
    this.updateChart();
  }

  private updateChart() {
    if (!this.viewInited || !this.servers) return;
    if (!this.chart) {
      this.chart = echarts.init(this.chartPanel.nativeElement);
    }
    let chartData: any = {
      xAxis: [],
      runningData: [],
      stoppedData: []
    };
    for (let server of this.servers) {
      chartData.xAxis.push(server.ip);
      if (server.errMsg) {
        chartData.runningData.push({
          value: 0,
          errMsg: server.errMsg
        });
        chartData.stoppedData.push({
          value: 0,
          errMsg: server.errMsg
        });
      } else {
        chartData.runningData.push(server.running.length || 0);
        chartData.stoppedData.push(server.stoped.length || 0);
      }
    }
    let option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any, ticket: any, callback: any) => {
          let msg = '';
          let length = params.length;
          for (let i = 0; i < length; i++) {
            let param = params[i];
            if (i === 0) {
              msg += `${param.name}`;
            }
            if (param.data && param.data.errMsg) {
              msg = `${param.name}<br>${param.data.errMsg}`;
              break;
            }
            msg += `<br>${param.seriesName}: ${param.value}`
          }
          return msg;
        }
      },
      legend: {
        data: ['Running', 'Stopped']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '70',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: chartData.xAxis,
        triggerEvent: true,
        axisLabel: {
          rotate: 60,
          interval: 0
        },
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, 0.01]
      },
      series: [
        {
          name: 'Stopped',
          type: 'bar',
          stack: 'Containers',
          barWidth: 15,
          data: chartData.stoppedData,
          itemStyle: {
            normal: {
              color: '#2f4554'
            }
          }
        },
        {
          name: 'Running',
          type: 'bar',
          stack: 'Containers',
          barWidth: 15,
          data: chartData.runningData,
          itemStyle: {
            normal: {
              color: '#61a0a8'
            }
          }
        }
      ]
    };
    this.chart.setOption(option);
    this.chart.on('click', (params: any) => {
      let ip = params.name || params.value;
      this._router.navigate(['/group', this.groupInfo.ID, ip, 'overview']);
    });
  }
}

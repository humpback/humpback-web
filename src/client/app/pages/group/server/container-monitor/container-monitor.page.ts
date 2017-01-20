import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

declare let _: any;
declare let moment: any;
declare let echarts: any;
declare let messager: any;
declare let fetch: any;

@Component({
  selector: 'hb-container-monitor',
  templateUrl: './container-monitor.html',
  styleUrls: ['./container-monitor.css']
})
export class ContainerMonitorPage {

  @ViewChild('cpuChart')
  private cpuChartDiv: ElementRef;

  @ViewChild('memoryChart')
  private memoryChartDiv: ElementRef;

  private containerId: string;
  private groupId: any = {};
  private ip: string;

  private cpuChart: any;
  private cpuChartOption: any;
  private memoryChart: any;
  private memoryChartOption: any;
  private refreshInterval: any;
  private continuousErrCount: number = 0;

  private subscribers: Array<any> = [];

  constructor(
    private _route: ActivatedRoute,
    private _router: Router) {

  }

  ngOnInit() {
    let paramSub = this._route.params.subscribe(params => {
      this.groupId = params['groupId'];
      this.ip = params['ip'];
      this.containerId = params['containerId'];
      clearInterval(this.refreshInterval);
    });
    this.subscribers.push(paramSub);    
  }

  ngOnDestroy() {
    clearInterval(this.refreshInterval);
    this.subscribers.forEach(item => item.unsubscribe());
  }

  ngAfterViewInit() {
    this.initChart();
  }

  private initChart(containerId?: string) {
    containerId = containerId || this.containerId;
    let cpuChartEle = this.cpuChartDiv.nativeElement;
    let memoryChartEle = this.memoryChartDiv.nativeElement;

    this.cpuChart = echarts.init(cpuChartEle);
    this.cpuChartOption = {
      title: {
        left: 'center',
        text: `${containerId} cpu usage`
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: []
      },
      yAxis: {
        type: 'value',
        min: 0,
        name: 'CPU'
      },
      series: [{
        type: 'line',
        name: 'CPU Usage',
        itemStyle: {
          normal: {
            color: 'rgb(100, 100, 100)'
          }
        },
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgb(100, 100, 100)'
            }, {
              offset: 1,
              color: 'rgb(0, 0, 0)'
            }])
          }
        },
        data: []
      }]
    };
    this.cpuChart.setOption(this.cpuChartOption);

    this.memoryChart = echarts.init(memoryChartEle);
    this.memoryChartOption = {
      title: {
        left: 'center',
        text: `${containerId} memory usage`
      },
      tooltip: {
        trigger: 'axis',
        formatter: (value: any) => {
          var msg = "";
          for (var item of value) {
            msg += item.name + "<br>";
            msg += "Memory Usage: " + (value[0].data / 1024).toFixed(2) + ' MB<br>';
          }
          return msg;
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: []
      },
      yAxis: {
        type: 'value',
        name: 'Memory',
        min: 0,
        axisLabel: {
          show: true,
          interval: 'auto',
          formatter: (value: any) => {
            return (value / 1024).toFixed() + ' MB';
          }
        }
      },
      series: [{
        type: 'line',
        name: 'Memory Usage',
        itemStyle: {
          normal: {
            color: 'rgb(100, 100, 100)'
          }
        },
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgb(100, 100, 100)'
            }, {
              offset: 1,
              color: 'rgb(0, 0, 0)'
            }])
          }
        },
        data: []
      }]
    };
    this.memoryChart.setOption(this.memoryChartOption);

    this.updateChart();
    this.refreshInterval = setInterval(() => {
      this.updateChart();
    }, 5000);
  }

  private updateChart() {
    let time = new Date();
    let self = this;
    let url = `http://${this.ip}:8500/v1/containers/${this.containerId}/stats`;
    fetch(url)
      .then((res: any) => {
        res.json().then((data: any) => {
          if (res.ok) {
            this.continuousErrCount = 0;
          } else {
            this.continuousErrCount++;
            if (this.continuousErrCount > 6) {
              clearInterval(this.refreshInterval);
              messager.error('Your container is not running, please check.');
            }
          }
          let timeStr = moment(time).format('HH:mm:ss');
          let cpuData = this.cpuChartOption.series[0].data;
          let memoryData = this.memoryChartOption.series[0].data;
          cpuData = cpuData || [];
          memoryData = memoryData || [];
          if (cpuData.length > 60) {
            cpuData.shift();
            this.cpuChartOption.xAxis.data.shift();
            memoryData.shift();
            this.memoryChartOption.xAxis.data.shift();
          }
          cpuData.push(data.CPUUsage || 0);
          memoryData.push(data.MemoryUsage || 0);
          this.cpuChartOption.xAxis.data.push(timeStr);
          this.cpuChart.setOption(this.cpuChartOption);
          this.memoryChartOption.xAxis.data.push(timeStr);
          this.memoryChart.setOption(this.memoryChartOption);
        })
      })
  }
}
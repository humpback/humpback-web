import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContainerService } from './../../../../services';

declare let $: any;
declare let messager: any;

@Component({
  selector: 'hb-container-log',
  templateUrl: './container-log.html',
  styleUrls: ['./container-log.css']
})
export class ContainerLogPage {

  @ViewChild('logPanel')
  private logPanel: ElementRef;

  private containerId: string;
  private groupId: any = {};
  private ip: string;

  private tailNum: number = 100;
  private logs: Array<string> = [];

  private subscribers: Array<any> = [];

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _containerService: ContainerService) {

  }

  ngOnInit() {
    let paramSub = this._route.params.subscribe(params => {
      this.groupId = params['groupId'];
      this.ip = params['ip'];
      this.containerId = params['containerId'];
      this.getLogs();
    });
    this.subscribers.push(paramSub);
  }

  ngOnDestroy() {
    this.subscribers.forEach(item => item.unsubscribe());
  }

  ngAfterViewInit() {
    $(window, ".wrapper").resize(() => {
      this.fixLogPanel();
    });
    this.fixLogPanel();
  }

  private tailNumChanged(value: any) {
    this.tailNum = value;
    this.getLogs();
  }

  private getLogs() {
    this._containerService.getLogs(this.ip, this.containerId, this.tailNum)
      .then(data => {
        this.logs = data.map((item: string) => {
          return item.replace(/^(\u0002\u0000\u0000\u0000\u0000\u0000\u0000)[0-9a-zA-z]{1,1}/, "");;
        });
        if (this.logs.length === 0) {
          $(this.logPanel.nativeElement).slimScroll({ destroy: true }).height("auto");
        } else {
          setTimeout(() => {
            let scrollHeight = this.logPanel.nativeElement.scrollHeight;
            $(this.logPanel.nativeElement).slimScroll({ scrollTo: `${scrollHeight}px` });
          }, 500);
        }
      })
      .catch(err => {
        this.logs = [];
        messager.error(err);
      });
  }

  private fixLogPanel() {    
    $(this.logPanel.nativeElement).slimScroll({ destroy: true }).height("auto");
    $(this.logPanel.nativeElement).slimscroll({
      height: ($(window).height() - this.logPanel.nativeElement.offsetTop - 15) + "px",
      color: "rgba(255,255,255,0.7)",
      size: "3px"
    });
  }
}
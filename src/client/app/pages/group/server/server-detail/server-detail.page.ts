import { Component, ViewChild, ElementRef} from "@angular/core"
import { CusHttpService } from './../../../../services';
import { ComposeService, ContainerService } from '../../../../services';
import { Router, ActivatedRoute } from '@angular/router';
import * as fileSaver from 'file-saver';

declare let _: any;
declare let messager: any;

@Component({
  selector: 'hb-server-detail',
  templateUrl: './server-detail.html',
  styleUrls: ['./server-detail.css']
})

export class ServerDetailPage {

  @ViewChild('logPanel')
  private logPanel: ElementRef;

  private service: any;
  private containerBasicInfo: Array<any> = [];
  private activedTab: string;
  private instances: any;
  private composeDataConfig: any;
  private _editors: any = {};
  private ip: any;
  private subscribers: Array<any> = [];
  private serviceName: any;
  private container: any;
  private containerId: any;
  private groupId: any;
  private logsViewModalOptions: any = {};
  private logs: Array<any>;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _composeService: ComposeService,
    private _containerService: ContainerService,
    private _http: CusHttpService,
  ){

  }

  ngOnInit(){
    this.service = {};
    this.container = {};
    let paramSub = this._route.params.subscribe(params => {
      this.ip = params['ip'];
      this.serviceName = params['serviceName'];
      this.groupId = params["groupId"];
    });
    this.subscribers.push(paramSub);
    this._composeService.getServiceByOne(this.ip, this.serviceName)
      .then(res => {
        this.service = res;
        this.activedTab = this.service.Containers[0].Name;
        this.containerId = this.service.Containers[0].Id;
        this.getContainerInfo(this.containerId);
        // let data = res.json();
      })
      .catch(err => {
        messager.error(err);
        this._router.navigate(['/cluster', this.groupId, 'overview']);
      });
      this.composeDataConfig = {
        // SystemId: this.systemId,
        ConfigKey: '',
        Description: '',
        ConfigValue: '',
        SandboxValue: '',
        _prdMode: 'json',
        _sandMode: 'yaml',
        _prdEnableCanary: false,
        _sandEnableCanary: false
      }
      this.logsViewModalOptions = {
        size: 'lg',
        show: false,
        title: '',
        hideFooter: true,
        closable: false,
        logs: []
      }
  }

  ngOnDestroy() {
    this.subscribers.forEach(item => item.unsubscribe());
  }

  private getContainerInfo(id: any){
    this._containerService.getById(this.ip, id)
    .then(data => {
      this.container = data;
      let stateText = '';
      if (this.container.State.Running) {
        stateText = 'Running';
      } else {
        stateText = 'Stopped';
      }
      if (this.container.State.Restarting) {
        stateText = 'Restarting';
      }
      if (this.container.State.Paused) {
        stateText = 'Paused';
      }
      if (this.container.State.Dead) {
        stateText = 'Dead';
      }
      this.container.State.StateText = stateText;
      this.container.formettedPortsBindings = this.container.NetworkSettings.Ports || this.container.HostConfig.PortBindings;
    })
    .catch(err => {
      messager.error(err.Detail || "Get containers failed.");
      this._router.navigate(['/group', this.groupId, this.ip, 'overview']);
    });
  }

  private aceLoaded(editor: any, env: string) {
    this._editors[env] = editor;
    editor.$blockScrolling = Infinity;
  }

  private downloadComposeData(){
    let content = '';
    let blob = new Blob([content], {type: "text/plain;charset=utf-8"});
    fileSaver.saveAs(blob, "content.yml")
  }

  private changeTab(tab: string, id: string) {
    this.activedTab = tab;
    this.getContainerInfo(id);
  }

  private getStatusCls(status: any) {
    let cls = 'success';
    if (status.Dead || !status.Running) {
      cls = 'danger';
    }
    if (status.Paused || status.Restarting) {
      cls = 'yellow';
    }
    return cls;
  }

  private getContainerStatus(status: any) {
    let cls = 'success';
    if (status.indexOf('Paused') !== -1 || status.indexOf('Restarting') !== -1 || status === 'Created') {
      cls = 'warning';
    }
    if (status.startsWith('Exited')) {
      cls = 'danger';
    }
    return cls;
  }

  private getContainerCommand(){
    return `${this.container.Path} ${this.container.Args.join(' ')}`
  }

  private showLogsView(instance: any) {
    this.logsViewModalOptions.selectedInstance = {
      ip: this.ip,
      container: instance.Id.substr(0, 12)
    };
    this.logsViewModalOptions.tailNum = 100;
    this.logsViewModalOptions.title = `Logs for ${instance.Name} on ${this.ip}`;
    this.getLogs();
    this.logsViewModalOptions.show = true;
  }

  private getLogs() {
    let instance = this.logsViewModalOptions.selectedInstance;
    this._containerService.getLogs(instance.ip, instance.container, this.logsViewModalOptions.tailNum)
      .then(data => {
        this.logs = data || [];
        if (this.logs.length > 0) {
          setTimeout(() => {
            $(this.logPanel.nativeElement).animate({ scrollTop: this.logPanel.nativeElement.scrollHeight }, '500', 'swing')
          }, 500);
        }
      })
      .catch(err => {
        this.logs = [];
        messager.error(err);
      });
  }

  private tailNumChanged(value: any) {
    this.logsViewModalOptions.tailNum = value;
    this.getLogs();
  }

  private getStatusText(status: any) {
    let stateText = '';
    if (status.Running) {
      stateText = 'Running';
    } else {
      stateText = 'Stopped';
    }
    if (status.Restarting) {
      stateText = 'Restarting';
    }
    if (status.Paused) {
      stateText = 'Paused';
    }
    if (status.Dead) {
      stateText = 'Dead';
    }
    return stateText;
  }
}

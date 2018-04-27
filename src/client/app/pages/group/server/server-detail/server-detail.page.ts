import { Component} from "@angular/core"
import { CusHttpService } from './../../../../services';
import { ComposeService } from '../../../../services/compose.service';
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

  private service: any;
  private containerBasicInfo: Array<any> = [];
  private activedTab: string;
  private instances: any;
  private composeDataConfig: any;
  private _editors: any = {};
  private ip: any;
  private subscribers: Array<any> = [];
  private serviceName: any;

  constructor(
    private _route: ActivatedRoute,
    private _composeService: ComposeService,
    private _http: CusHttpService,
  ){

  }

  ngOnInit(){
    this.service = {};
    let paramSub = this._route.params.subscribe(params => {
      this.ip = params['ip'];
      this.serviceName = params['serviceName'];
    });
    this.subscribers.push(paramSub);
    this._composeService.getServiceByOne(this.ip, this.serviceName)
      .then(res => {
        this.service = res;
        this.activedTab = this.service.Containers[0].Name;
        // let data = res.json();
      })
      .catch(err => {
        messager.error(err);
        // this._router.navigate(['/cluster', this.groupInfo.ID, 'overview']);
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

  private changeTab(tab: string) {
    this.activedTab = tab;
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

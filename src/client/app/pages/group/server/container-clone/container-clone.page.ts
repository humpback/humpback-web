import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { Select2OptionData } from 'ng2-select2';
import { ContainerService, GroupService, LogService } from './../../../../services';
import { IContainer } from './../../../../interfaces';
import { IPValidator } from './../../../../validators';

declare let _: any;
declare let messager: any;

@Component({
  selector: 'hb-container-clone',
  templateUrl: './container-clone.html',
  styleUrls: ['./container-clone.css']
})
export class ContainerClonePage {

  private groups: Array<any>;
  private groupInfo: any;
  private ip: string;
  private containerId: string;
  private containerInfo: any;

  private selectedGroupId: string = '';
  private selectedGroup: any;
  private serversSelect2Options: any;
  private servers: Array<any> = [];
  private selectedServers: Array<any>;
  private currentEditEnvServer: string;
  private cloneProcessModalOptions: any;
  private cloneProcessMsg: Array<any>;
  private isCloneDone: Array<any>;

  private form: FormGroup;
  private submitted: boolean = false;

  private subscribers: Array<any> = [];

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _fb: FormBuilder,
    private _containerService: ContainerService,
    private _groupService: GroupService,
    private _logService: LogService) {

  }

  ngOnInit() {
    this.cloneProcessModalOptions = {
      show: false,
      title: 'INFO',
      closable: false,
      hideCloseBtn: true
    }
    this.serversSelect2Options = {
      multiple: true,
      closeOnSelect: false,
      minimumResultsForSearch: -1,
      placeholder: 'Select server',
      dropdownAutoWidth: true
    };
    let paramSub = this._route.params.subscribe(params => {
      let groupId = params['groupId'];
      this.ip = params['ip'];
      this.containerId = params["containerId"];

      this.groupInfo = { ID: groupId };
      this.containerInfo = {};
      this._groupService.get()
        .then(data => {
          this.groupInfo = _.find(data, (item: any) => {
            return item.ID === groupId;
          });
          if (!this.groupInfo) {
            return Promise.reject('No group found.');
          }
          this.groups = data;
          return this._containerService.getById(this.ip, this.containerId, true);
        })
        .then(containerInfo => {
          this.containerInfo = containerInfo;
          this.buildForm(containerInfo);
        })
        .catch(err => {
          messager.error(err);
          this._router.navigate(['/group']);
        });
    });
    this.subscribers.push(paramSub);
  }

  ngOnDestroy() {
    this.subscribers.forEach((item: any) => item.unsubscribe());
  }

  private buildForm(data: any) {
    this.form = this._fb.group({
      Name: [''],
      Image: [data.Image],
      Command: [data.Command],
      HostName: [''],
      NetworkMode: [data.NetworkMode],
      RestartPolicy: [data.RestartPolicy],
      Ports: this._fb.array([]),
      Volumes: this._fb.array([]),
      Envs: this._fb.array([]),
      Links: this._fb.array([]),
      LogDriver: data.LogConfig ? (data.LogConfig.LogDriver  || 'json-file') : 'json-file',
      LogOpts: this._fb.array([]),
      Dns: [data.Dns],
      CPUShares: data.CPUShares === 0 ? '' : data.CPUShares,
      Memory: data.Memory === 0 ? '' : data.Memory,
      ServerEnvs: this._fb.group({})
    });

    if (data.RestartPolicy === 'on-failure') {
      let tempCtrl = new FormControl(data.RestartRetryCount);
      this.form.addControl('RestartRetryCount', tempCtrl);
    }

    if (data.NetworkMode !== 'host' && data.Ports.length > 0) {
      let portsCtrl = <FormArray>this.form.controls['Ports'];
      data.Ports.forEach((item: any) => {
        portsCtrl.push(this._fb.group({
          PrivatePort: [item.PrivatePort],
          Type: [item.Type || 'tcp'],
          PublicPort: [item.PublicPort === 0 ? '' : item.PublicPort],
          IP: [item.Ip]
        }))
      });
    }

    if (data.Volumes) {
      let volumeCtrl = <FormArray>this.form.controls['Volumes'];
      data.Volumes.forEach((item: any) => {
        volumeCtrl.push(this._fb.group({
          ContainerVolume: item.ContainerVolume,
          HostVolume: item.HostVolume
        }));
      });
    }

    if (data.Env) {
      let envCtrl = <FormArray>this.form.controls['Envs'];
      data.Env.forEach((item: any) => {
        envCtrl.push(this._fb.group({
          Value: item
        }));
      });
    }

    if (data.Links) {
      let control = <FormArray>this.form.controls['Links'];
      data.Links.forEach((item: any) => {
        control.push(this._fb.group({
          "Value": [item]
        }));
      })
    }

    if(data.LogConfig){
      if(data.LogConfig.Config){
        let cloneOptsArr = [];
        for(let key in data.LogConfig.Config){
          cloneOptsArr.push(`${key}=${data.LogConfig.Config[key]}`)
        }
        let control = <FormArray>this.form.controls['LogOpts'];
        cloneOptsArr.forEach((item: any) => {
          control.push(this._fb.group({
            "Value": [item]
          }));
        })
      }
    }

    let restartSub = this.form.controls['RestartPolicy'].valueChanges.subscribe(value => {
      if (value === 'on-failure') {
        let control = new FormControl('');
        this.form.addControl('RestartRetryCount', control);
      } else {
        this.form.removeControl('RestartRetryCount');
      }
    });
    this.subscribers.push(restartSub);

    let networkModeSub = this.form.controls['NetworkMode'].valueChanges.subscribe(value => {
      if (value === 'host') {
        this.form.removeControl('HostName');
        this.form.removeControl('Ports');
        this.form.removeControl('NetworkName');
      } else {
        let hostNameCtrl = new FormControl('');
        this.form.addControl('HostName', hostNameCtrl);

        let portBindingCtrl = this._fb.array([]);
        this.form.addControl('Ports', portBindingCtrl);
      }
      if (value === "custom") {
        let networkNameCtrl = new FormControl('');
        this.form.addControl('NetworkName', networkNameCtrl);
      }
    });
    this.subscribers.push(networkModeSub);
  }

  private selectedGroupChanged(value: any) {
    this.selectedGroup = _.find(this.groups, (item: any) => {
      return item.ID === value;
    });
    this.servers = [];
    let tempData = this.selectedGroup.Servers || [];
    tempData.forEach((item: any) => {
      let temp: any = { id: item.IP || item.Name, text: item.IP };
      if (item.Name) {
        temp.text = item.Name;
        if (item.IP) temp.text = `${item.Name}(${item.IP})`;
      }
      this.servers.push({
        id: item.IP || item.Name,
        text: item.Name || item.IP
      })
    });
  }

  private refreshSelectedServer(data: any) {
    let selectedServers = (data.value || []).sort();
    let control = <FormGroup>this.form.controls['ServerEnvs'];
    if (!control) {
      control = this._fb.group({});
      this.form.addControl('ServerEnvs', control);
    }
    let currentServers = Object.keys(control.controls);
    for (let server of currentServers) {
      if (selectedServers.indexOf(server) !== -1) continue;
      control.removeControl(server);
    }
    for (let server of selectedServers) {
      if (!control.contains[server]) {
        let envCtrl = this._fb.array([]);
        if (this.containerInfo && this.containerInfo.Env) {
          this.containerInfo.Env.forEach((item: any) => {
            envCtrl.push(this._fb.group({
              Value: item
            }));
          });
        }
        control.addControl(server, envCtrl);
      }
    }
    this.selectedServers = selectedServers;
    this.currentEditEnvServer = this.selectedServers[0] || '';
  }

  private addPortBinding() {
    let control = <FormArray>this.form.controls['Ports'];
    control.push(this._fb.group({
      PrivatePort: [''],
      Type: ['tcp'],
      PublicPort: [''],
      IP: ['0.0.0.0']
    }));
  }

  private removePortBinding(i: number) {
    let control = <FormArray>this.form.controls['Ports'];
    control.removeAt(i);
  }

  private addVolumeBinding() {
    let control = <FormArray>this.form.controls['Volumes'];
    control.push(this._fb.group({
      ContainerVolume: [''],
      HostVolume: ['']
    }));
  }

  private removeVolumeBinding(i: number) {
    let control = <FormArray>this.form.controls['Volumes'];
    control.removeAt(i);
  }

  private addEnv(server: string) {
    let control = <FormGroup>this.form.controls['ServerEnvs'];
    let envCtrl = <FormArray>control.controls[server];
    envCtrl.push(this._fb.group({
      "Value": ['']
    }));
  }

  private removeEnv(server: string, i: number) {
    let control = <FormGroup>this.form.controls['ServerEnvs'];
    let envCtrl = <FormArray>control.controls[server];
    envCtrl.removeAt(i);
  }

  private addLink() {
    let control = <FormArray>this.form.controls['Links'];
    control.push(this._fb.group({
      "Value": ['']
    }));
  }

  private removeLink(i: number) {
    let control = <FormArray>this.form.controls['Links'];
    control.removeAt(i);
  }

  private addLogOpt() {
    let control = <FormArray>this.form.controls['LogOpts'];
    control.push(this._fb.group({
      "Value": ['']
    }));
  }

  private removeLogOpt(i: number) {
    let control = <FormArray>this.form.controls['LogOpts'];
    control.removeAt(i);
  }

  private onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;
    if (!this.selectedServers || !this.selectedServers.length) {
      messager.error('Please select one server at least');
      return;
    }
    let formData = _.cloneDeep(this.form.value);

    let optsArr = (formData.LogOpts || []).map((item: any) => item.Value);
    let optsObj = {};
    optsArr.forEach((item: any) => {
      let splitArr = item.split('=');
      optsObj[splitArr[0]] = splitArr[1];
    })
    let config: IContainer = {
      Name: formData.Name,
      Image: formData.Image,
      Command: formData.Command,
      HostName: formData.HostName,
      NetworkMode: formData.NetworkMode === 'custom' ? formData.NetworkName : formData.NetworkMode,
      RestartPolicy: formData.RestartPolicy,
      RestartRetryCount: formData.RestartRetryCount,
      Ports: (formData.Ports || []).map((item: any) => {
        item.PublicPort = item.PublicPort || 0;
        return item;
      }),
      Volumes: formData.Volumes,
      Env: [],
      Dns: formData.Dns,
      Links: (formData.Links || []).map((item: any) => item.Value),
      LogConfig: {
        Type: formData.LogDriver,
        Config: optsObj
      },
      CPUShares: formData.CPUShares || 0,
      Memory: formData.Memory || 0
    }

    this.cloneProcessMsg = [];
    this.isCloneDone = [];
    this.cloneProcessModalOptions.show = true;
    let self = this;
    for (let server of this.selectedServers) {
      let containerConf = _.cloneDeep(config);
      (function (server: string, containerConf: IContainer) {
        containerConf.Env = (formData.ServerEnvs[server] || []).map((item: any) => item.Value);
        self.addCloneMsg(server, "Begin to create container");
        self._containerService.create(server, containerConf, true)
          .then((data) => {
            self.addCloneMsg(server, "Done!");
            self._logService.addLog(`Clone ${containerConf.Name} from ${self.ip} to ${server}`, 'Container', self.groupInfo.ID, self.ip);
            self.isCloneDone.push(true);
          })
          .catch((err) => {
            let errMsg = err.Detail || JSON.stringify(err);
            self.addCloneMsg(server, `Failed! Detail: ${errMsg}`);
            self.isCloneDone.push(false);
          });
      })(server, containerConf);
    }
  }

  private addCloneMsg(server: string, msg: string) {
    this.cloneProcessMsg.push({
      time: new Date(),
      server: server,
      msg: msg
    });
  }

  private closeUpgradeProgressModal() {
    this.cloneProcessModalOptions.show = false;
    this._router.navigate(['/group', this.groupInfo.ID, 'overview']);
  }
}

import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { ContainerService, GroupService, LogService, ComposeService } from './../../../../services';
import { IContainer } from './../../../../interfaces';
import { IPValidator } from './../../../../validators';

declare let _: any;
declare let messager: any;

@Component({
  selector: 'hb-container-new',
  templateUrl: './container-new.html',
  styleUrls: ['./container-new.css']
})
export class ContainerNewPage {

  private groupInfo: any;
  private ip: string;

  private form: FormGroup;
  private submitted: boolean = false;
  private hasGetDockerInfo: boolean = false;

  private isNew: boolean;
  private isEdit: boolean;

  private agentInvalid: boolean = false;
  private containerId: string;
  private containerInfo: any;
  private servers: any;
  private serversSelect2Options: Select2Options;
  private selectedServers: Array<any> = [];

  private subscribers: Array<any> = [];

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _fb: FormBuilder,
    private _containerService: ContainerService,
    private _composeService: ComposeService,
    private _groupService: GroupService,
    private _logService: LogService) {

  }

  ngOnInit() {
    this.isNew = !!this._route.snapshot.data['IsNew'];
    this.isEdit = !!this._route.snapshot.data['IsEdit'];

    this.serversSelect2Options = {
      multiple: true,
      closeOnSelect: false,
      minimumResultsForSearch: -1,
      placeholder: 'Select server',
      dropdownAutoWidth: true
    };

    let paramSub = this._route.params.subscribe(params => {
      let groupId = params["groupId"];
      this.ip = params["ip"];
      this.selectedServers = [this.ip];
      this.containerId = params["containerId"];
      this.groupInfo = { ID: groupId };
      this._groupService.getById(groupId)
        .then(data => {
          this.groupInfo = data;
        });
        if (this.isNew) {
          this.buildForm();
        }
        if (this.isEdit) {
          this._composeService.getAgentInfo(this.ip)
            .then(data => {
              if (data.AppVersion >= "1.3.4") {
                this.agentInvalid = false;
                this._containerService.getById(this.ip, this.containerId, true)
                  .then(containerInfo => {
                    this.containerInfo = containerInfo;
                    this.buildForm();
                    this.servers = [];
                    this.groupInfo.Servers.forEach((item: any) => {
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
                  })
              } else {
                this.agentInvalid = true;
              }
            })
            .catch(err => {
              messager.error(err.message || "Server is no response");
            })
        }
    });
    this.subscribers.push(paramSub);
  }

  ngOnDestroy() {
    this.subscribers.forEach(item => item.unsubscribe());
  }

  private refreshSelectedServer(data: any) {
    this.selectedServers = data.value || [];
  }

  private buildForm() {
    let data = this.containerInfo || {};
    this.form = this._fb.group({
      Name: [{ value: (data.Name || ''), disabled: (this.isEdit) }],
      Image: [data.Image] || [''],
      Command: [data.CommandWithoutEntryPoint || data.Command] || [''],
      HostName: [''],
      NetworkMode: [data.NetworkMode || 'host'],
      RestartPolicy: [data.RestartPolicy || 'no'],
      Ports: this._fb.array([]),
      Volumes: this._fb.array([]),
      Envs: this._fb.array([]),
      Links: this._fb.array([]),
      Labels: this._fb.array([]),
      Ulimits: this._fb.array([]),
      EnableLogFile: data.LogConfig ? (data.LogConfig.Type ? 1 : 0) : 0 || 0,
      LogDriver: data.LogConfig ? (data.LogConfig.Type || 'json-file') : 'json-file' || 'json-file',
      LogOpts: this._fb.array([]),
      Dns: [data.Dns] || [[]],
      CPUShares: data.CPUShares === 0 ? '' : data.CPUShares || [''],
      Memory: data.Memory === 0 ? '' : data.Memory || ['']
    });

    if (this.form.controls.EnableLogFile.value) {
      this.hasGetDockerInfo = true;
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

    let logConfigSub = this.form.controls['EnableLogFile'].valueChanges.subscribe(value => {
      if (value) {
        let logDriverCtrol = new FormControl('json-file');
        this.form.addControl('LogDriver', logDriverCtrol);

        let logOptsCtrl = this._fb.array([]);
        this.form.addControl('LogOpts', logOptsCtrl);
      } else {
        this.form.removeControl('LogDriver');
        this.form.removeControl('LogOpts');
      }
    })
    this.subscribers.push(logConfigSub);

    let networkModeSub = this.form.controls['NetworkMode'].valueChanges.subscribe(value => {
      if (value === 'host') {
        this.form.removeControl('HostName');
        this.form.removeControl('Ports');
      } else {
        let hostNameCtrl = new FormControl('');
        this.form.addControl('HostName', hostNameCtrl);

        let portBindingCtrl = this._fb.array([]);
        this.form.addControl('Ports', portBindingCtrl);
      }
      if (value === "custom") {
        let networkNameCtrl = new FormControl('');
        this.form.addControl('NetworkName', networkNameCtrl);
      } else {
        this.form.removeControl('NetworkName');
      }
    });
    this.subscribers.push(networkModeSub);


    if (this.isEdit) {
      if (data.RestartPolicy === 'on-failure') {
        let tempCtrl = new FormControl(data.RestartRetryCount);
        this.form.addControl('RestartRetryCount', tempCtrl);
      }

      if (data.NetworkMode !== 'host' && data.Ports && data.Ports.length > 0) {
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

      if (data.Links) {
        let control = <FormArray>this.form.controls['Links'];
        data.Links.forEach((item: any) => {
          control.push(this._fb.group({
            "Value": [item]
          }));
        })
      }

      if (data.Env) {
        let control = <FormArray>this.form.controls['Envs'];
        data.Env.forEach((item: any) => {
          control.push(this._fb.group({
            "Value": [item]
          }));
        })
      }

      if (data.Labels) {
        let control = <FormArray>this.form.controls['Labels'];
        for (let key in data.Labels) {
          control.push(this._fb.group({
            "Value": [`${key}:${data.Labels[key]}`]
          }));
        }
      }

      if (data.LogConfig) {
        if (data.LogConfig.Config) {
          let cloneOptsArr = [];
          for (let key in data.LogConfig.Config) {
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

      if (data.Ulimits) {
        let control = <FormArray>this.form.controls['Ulimits'];
        data.Ulimits.forEach((item: any) => {
          control.push(this._fb.group({
            "Name": [item['Name']],
            "Soft": [item['Soft']],
            "Hard": [item['Hard']]
          }));
        })
      }
      // if (this.form.controls.EnableLogFile.value || data.Ulimits) {
      //   this.AdvancedDisplay = true;
      // }
    }
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

  private addEnv() {
    let control = <FormArray>this.form.controls['Envs'];
    control.push(this._fb.group({
      "Value": ['']
    }));
  }

  private removeEnv(i: number) {
    let control = <FormArray>this.form.controls['Envs'];
    control.removeAt(i);
  }

  private addLink() {
    let control = <FormArray>this.form.controls['Links'];
    control.push(this._fb.group({
      "Value": ['']
    }));
  }

  private addLabel() {
    let control = <FormArray>this.form.controls['Labels'];
    control.push(this._fb.group({
      "Value": ['']
    }));
  }

  private removeLabel(i: number) {
    let control = <FormArray>this.form.controls['Labels'];
    control.removeAt(i);
  }

  private addUlimit() {
    let control = <FormArray>this.form.controls['Ulimits'];
    control.push(this._fb.group({
      Name: [''],
      Soft: [''],
      Hard: ['']
    }));
  }

  private removeUlimit(i: number) {
    let control = <FormArray>this.form.controls['Ulimits'];
    control.removeAt(i);
  }

  private getTargetLogDriver(){
    if(!this.hasGetDockerInfo && this.form.controls.LogDriver.value && this.form.controls.LogOpts.value.length == 0){
      this._containerService.getDockerInfo(this.ip)
      .then((data:any) => {
        if(data && data.LoggingDriver){
          this.form.controls.LogDriver.setValue(data.LoggingDriver);
        }
        if(data && data.LoggingDriver == 'json-file'){
          let control = <FormArray>this.form.controls['LogOpts'];
          control.push(this._fb.group({
            "Value": ['max-size=10m']
          }));
          control.push(this._fb.group({
            "Value": ['max-file=3']
          }));
        }
        this.hasGetDockerInfo = true;
      })
      .catch(err => {
        let control = <FormArray>this.form.controls['LogOpts'];
          control.push(this._fb.group({
            "Value": ['max-size=10m']
          }));
          control.push(this._fb.group({
            "Value": ['max-file=3']
          }));
      })
    }
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
    if (!this.selectedServers || !this.selectedServers.length) {
      messager.error('Please select one server at least');
      return;
    }
    if (this.form.invalid) return;
    let formData = _.cloneDeep(this.form.value);

    let optsObj = {};
    let postLables = {};
    if(this.form.controls.EnableLogFile.value){
      let optsArr = (formData.LogOpts || []).map((item: any) => item.Value);
      optsArr.forEach((item: any) => {
        let splitArr = item.split('=');
        optsObj[splitArr[0]] = splitArr[1];
      })
    }

    if (formData.Labels) {
      if (formData.Labels.length > 0) {
        formData.Labels.forEach((item: any) => {
          let key = item.Value.split(":")[0];
          let value = item.Value.split(":")[1];
          postLables[key] = value;
        })
      }
    }

    let config: any = {
      Name: this.form.controls.Name.value,
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
      Env: (formData.Envs || []).map((item: any) => item.Value),
      Dns: formData.Dns,
      Links: (formData.Links || []).map((item: any) => item.Value),
      Labels: postLables || {},
      CPUShares: formData.CPUShares || 0,
      Memory: formData.Memory || 0
    }
    if(this.form.controls.EnableLogFile.value){
      config.LogConfig = {
        Type: formData.LogDriver,
        Config: optsObj
      }
    }

    if (formData.Ulimits.length > 0) {
      config.Ulimits = formData.Ulimits;
    }
    if (this.isEdit) {
      config.Id = this.containerInfo.Id;
      this.selectedServers.forEach((item: any) => {
        this._containerService.create(item, config)
          .then(data => {
            messager.success('succeed');
            this._logService.addLog(`Edit container ${config.Name} on ${this.ip}`, 'Container', this.groupInfo.ID, this.ip);
            this._router.navigate(['/group', this.groupInfo.ID, this.ip, 'containers', config.Name]);
          })
          .catch(err => {
            messager.error(err.Detail || err);
          });
      })
    } else {
      this._containerService.create(this.ip, config)
        .then(data => {
          messager.success('succeed');
          this._logService.addLog(`Create container ${config.Name} on ${this.ip}`, 'Container', this.groupInfo.ID, this.ip);
          this._router.navigate(['/group', this.groupInfo.ID, this.ip, 'containers', config.Name]);
        })
        .catch(err => {
          messager.error(err.Detail || err);
        });
    }
  }
}

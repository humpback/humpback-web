import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { ContainerService, GroupService, LogService } from './../../../../services';
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
    let paramSub = this._route.params.subscribe(params => {
      let groupId = params["groupId"];
      this.groupInfo = { ID: groupId };
      this._groupService.getById(groupId)
        .then(data => {
          this.groupInfo = data;
        });
      this.ip = params["ip"];
      this.buildForm();
      let control = <FormArray>this.form.controls['LogOpts'];
      control.push(this._fb.group({
        "Value": ['max-size=10m']
      }));
      control.push(this._fb.group({
        "Value": ['max-file=3']
      }));
    });
    this.subscribers.push(paramSub);
  }

  ngOnDestroy() {
    this.subscribers.forEach(item => item.unsubscribe());
  }

  private buildForm() {
    this.form = this._fb.group({
      Name: [''],
      Image: [''],
      Command: [''],
      HostName: [''],
      NetworkMode: ['host'],
      RestartPolicy: ['no'],
      Ports: this._fb.array([]),
      Volumes: this._fb.array([]),
      Envs: this._fb.array([]),
      Links: this._fb.array([]),
      LogDriver: 'json-file',
      LogOpts: this._fb.array([]),
      Dns: [[]],
      CPUShares: [''],
      Memory: ['']
    });

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
      Env: (formData.Envs || []).map((item: any) => item.Value),
      Dns: formData.Dns,
      Links: (formData.Links || []).map((item: any) => item.Value),
      LogConfig: {
        Type: formData.LogDriver,
        Config: optsObj
      },
      CPUShares: formData.CPUShares || 0,
      Memory: formData.Memory || 0
    }
    this._containerService.create(this.ip, config)
      .then(data => {
        messager.success('succeed');
        this._logService.addLog(`Created container ${config.Name} on ${this.ip}`, 'Container', this.groupInfo.ID, this.ip);
        this._router.navigate(['/group', this.groupInfo.ID, this.ip, 'containers', config.Name]);
      })
      .catch(err => {
        messager.error(err.Detail || err);
      });
  }
}

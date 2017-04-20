import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { GroupService, ClusterService, LogService, ContainerService } from './../../../services';

declare let _: any;
declare let messager: any;
declare let $: any;

@Component({
  selector: 'cluster-container-info',
  templateUrl: './container-info.html',
  styleUrls: ['./container-info.css']
})
export class ClusterContainerInfoPage {
  @ViewChild('logPanel')
  private logPanel: ElementRef;

  private groupInfo: any = {};
  private container: any;
  private containerBasicInfo: Array<any> = [];
  private metaId: string;
  private activedTab: string;
  private instances: any;

  private logs: Array<any>;

  private deleteContainerModalOptions: any = {};
  private upgradeContainerModalOptions: any = {};
  private reAssignConfirmModalOptions: any = {};
  private logsViewModalOptions: any = {};
  private advanceSettingModalOptions: any = {};
  private advanceSettingForm: FormGroup;
  private selectTag: string;
  private candidateTags: Array<any>;

  private subscribers: Array<any> = [];

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _groupService: GroupService,
    private _clusterService: ClusterService,
    private _logService: LogService,
    private _containerService: ContainerService) {

  }

  ngOnInit() {
    let modalCommonOptions = {
      show: false,
      title: 'WRAN',
      closable: false
    };
    this.deleteContainerModalOptions = _.cloneDeep(modalCommonOptions);
    this.upgradeContainerModalOptions = _.cloneDeep(modalCommonOptions);
    this.upgradeContainerModalOptions.title = "Upgrade";
    this.upgradeContainerModalOptions.hideFooter = true;
    this.reAssignConfirmModalOptions = _.cloneDeep(modalCommonOptions);
    this.advanceSettingModalOptions = {
      size: 'lg',
      show: false,
      title: 'Advance Setting',
      hideFooter: true,
      closable: false,
      submitted: false
    };
    this.logsViewModalOptions = {
      size: 'lg',
      show: false,
      title: '',
      hideFooter: true,
      closable: false,
      logs: []
    }

    let paramSub = this._route.params.subscribe(params => {
      let groupId = params["groupId"];
      this.metaId = params["metaId"];
      this.groupInfo = { ID: groupId };
      this._groupService.getById(groupId)
        .then(data => {
          this.groupInfo = data;
          this.getContainer();
        })
        .catch(err => {
          messager.error(err);
          this._router.navigate(['/cluster', groupId, 'overview']);
        });
    });
    this.subscribers.push(paramSub);
  }

  ngOnDestroy() {
    this.subscribers.forEach(item => item.unsubscribe());
  }

  private getContainer() {
    this.container = {};
    this._clusterService.getClusterContainer(this.metaId)
      .then(res => {
        let data = res.Data.Container;
        this.container = data;
        if (this.container.Containers && this.container.Containers.length) {
          this.container.Containers = _.sortBy(this.container.Containers, ['IP', "HostName"]);
          this.activedTab = this.container.Containers[0].IP;
        }
        let basicInfo = {
          'Image': data.Config.Image,
          'Hostname': data.Config.HostName,
          'Command': data.Config.Command,
          'Restart Policy': (data.Config.RestartPolicy || '').toUpperCase(),
          'Network Mode': (data.Config.NetworkMode || '').toUpperCase(),
          'CpuShares': data.Config.CpuShares || 'Unlimited',
          'Memory Limit': data.Config.Memory ? `${(data.Config.Memory / 1024 / 1024)} MB` : 'Unlimited',
          'Instances': data.Instances
        };
        this.containerBasicInfo = [];
        for (let key in basicInfo) {
          this.containerBasicInfo.push({
            title: key,
            content: basicInfo[key]
          });
        }

        this.instances = {};
        this.container.Running = 0;
        this.container.Stopped = 0;
        (data.Containers || []).forEach((item: any) => {
          if (!this.instances[item.IP]) this.instances[item.IP] = { Running: 0, Stopped: 0, Containers: [] };
          this.instances[item.IP].Containers.push(item.Container);
          if (item.Container.Status.Running) {
            this.instances[item.IP].Running++;
            this.container.Running++;
          } else {
            this.instances[item.IP].Stopped++;
            this.container.Stopped++;
          }
        });
      })
      .catch(err => {
        messager.error(err);
        this._router.navigate(['/cluster', this.groupInfo.ID, 'overview']);
      });
  }

  private operate(action: string, event: any) {
    if (event && event.target.classList.contains('disable')) {
      event.stopPropagation();
      return;
    }
    this._clusterService.operate(this.container.MetaId, action)
      .then(data => {
        messager.success('succeed');
        this._logService.addLog(`${action} container ${this.container.Config.Name} on ${this.groupInfo.Name}`, 'Cluster', this.groupInfo.ID);
        this.getContainer();
      })
      .catch(err => {
        messager.error(err);
      });
  }

  private showDeleteModal(event: any) {
    if (event && event.target.classList.contains('disable')) {
      event.stopPropagation();
      return;
    }
    this.deleteContainerModalOptions.show = true;
  }

  private deleteContainer() {
    this.deleteContainerModalOptions.show = false;
    this._clusterService.deleteContainer(this.container.MetaId)
      .then(data => {
        this._logService.addLog(`Deleted container ${this.container.Config.Name} on ${this.groupInfo.Name}`, 'Cluster', this.groupInfo.ID);
        this._router.navigate(["/cluster", this.groupInfo.ID, 'overview']);
      })
      .catch((err) => {
        messager.error(err);
      });
  }

  private showUpgradeModal() {
    this.selectTag = '';
    this.upgradeContainerModalOptions.formSubmitted = false;
    this.upgradeContainerModalOptions.show = true;
  }

  private upgrade(form: any) {
    this.upgradeContainerModalOptions.formSubmitted = true;
    if (form.invalid) return;
    let newImage = `${this.container.Config.Image.split(':')[0]}:${form.value.newTag}`;
    this._clusterService.upgradeImage(this.metaId, form.value.newTag)
      .then(res => {
        messager.success('succeed');
        this.upgradeContainerModalOptions.show = false;
        this._logService.addLog(`Upgrade container ${this.container.Config.Name} from ${this.container.Config.Image} to ${newImage} on ${this.groupInfo.Name}`, 'Cluster', this.groupInfo.ID);
        this.getContainer();
      })
      .catch(err => messager.error(err));
  }

  private showReAssignConfirm() {
    this.reAssignConfirmModalOptions.show = true;
  }

  private reAssign() {
    messager.error('not implement');
  }

  private showAdvanceSettingModal() {
    if (!this.advanceSettingForm) {
      this.advanceSettingForm = this._fb.group({
        Instances: [this.container.Instances || '']
      });
    } else {
      this.advanceSettingForm.removeControl('WebHooks');
      this.advanceSettingForm.controls['Instances'].setValue(this.container.Instances || '');
    }
    if (this.container.WebHooks && this.container.WebHooks.length > 0) {
      let hooksCtrl = this._fb.array([]);
      this.container.WebHooks.forEach((item: any) => {
        hooksCtrl.push(this._fb.group({
          Url: item.Url,
          SecretToken: item.SecretToken
        }));
      });
      this.advanceSettingForm.addControl('WebHooks', hooksCtrl)
    } else {
      this.advanceSettingForm.addControl('WebHooks', this._fb.array([]));
    }
    this.advanceSettingModalOptions.show = true;
    this.advanceSettingModalOptions.submitted = false;
  }

  private removeWebhook(index: number) {
    let hooksCtrl = <FormArray>this.advanceSettingForm.controls['WebHooks'];
    hooksCtrl.removeAt(index);
  }

  private addWebhook() {
    let hooksCtrl = <FormArray>this.advanceSettingForm.controls['WebHooks'];
    hooksCtrl.push(this._fb.group({
      Url: '',
      SecretToken: ''
    }));
  }

  private updateAdvanceSetting() {
    this.advanceSettingModalOptions.submitted = true;
    if (this.advanceSettingForm.invalid) return;
    let formData = this.advanceSettingForm.value;
    if (formData.WebHooks.length > 0) {
      let temp = {};
      let duplicates: Array<any> = [];
      formData.WebHooks.forEach((item: any) => {
        let url = item.Url.toLowerCase();
        if (!temp[url]) temp[url] = 0;
        temp[url]++;
        if (temp[url] === 2) {
          duplicates.push(item.Url);
        }
      });
      if (duplicates.length > 0) {
        messager.error(`You cann't add duplicate url [${duplicates}] to webhook.`);
        return;
      }
    }

    let customerPort = _.findIndex(this.container.Config.Ports, (item: any) => {
      return item.PublicPort > 0;
    });

    let config: any = {
      MetaId: this.metaId,
      WebHooks: formData.WebHooks,
      Instances: formData.Instances
    };
    this._clusterService.updateContainer(config)
      .then(res => {
        messager.success('Update Succeed!');
        this.advanceSettingModalOptions.show = false;
        this.getContainer();
      })
      .catch(err => messager.error(err));
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

  private showLogsView(ip: string, instance: any) {
    this.logsViewModalOptions.selectedInstance = {
      ip: ip,
      container: instance.Id.substr(0, 12)
    };
    this.logsViewModalOptions.tailNum = 100;
    this.logsViewModalOptions.title = `Logs for ${instance.Name.substr(17)} on ${ip}`;
    this.getLogs();
    this.logsViewModalOptions.show = true;
  }

  private tailNumChanged(value: any) {
    this.logsViewModalOptions.tailNum = value;
    this.getLogs();
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
}

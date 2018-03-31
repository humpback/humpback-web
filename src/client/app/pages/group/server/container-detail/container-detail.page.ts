import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Select2OptionData } from 'ng2-select2';
import { ContainerService, ImageService, GroupService, HubService, LogService } from './../../../../services';

declare let _: any;
declare let messager: any;
declare let moment: any;

@Component({
  selector: 'hb-container-detail',
  templateUrl: './container-detail.html',
  styleUrls: ['./container-detail.css']
})
export class ContainerDetailPage {

  private container: any = {};
  private containerBasicInfo: Array<any> = [];
  private groupInfo: any;
  private ip: string;
  private containerId: string;

  private servers: Array<any>;
  private selectedServers: Array<any> = [];
  private serversSelect2Options: Select2Options;

  private deleteContainerModalOptions: any = {};
  private forceDeletion: boolean = false;
  private renameContainerModalOptions: any = {};
  private upgradeContainerModalOptions: any = {};
  private upgradeProgressModalOptions: any = {};

  private isUpgradeDone: Array<any> = [];
  private upgradeProcessMsg: Array<any> = [];

  private subscribers: Array<any> = [];

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _containerService: ContainerService,
    private _imageService: ImageService,
    private _groupService: GroupService,
    private _hubService: HubService,
    private _logService: LogService) {

  }

  ngOnInit() {
    let modalCommonOptions = {
      show: false,
      title: 'WRAN',
      closable: false
    };
    this.deleteContainerModalOptions = _.cloneDeep(modalCommonOptions);
    this.renameContainerModalOptions = _.cloneDeep(modalCommonOptions);
    this.renameContainerModalOptions.title = "Rename";
    this.renameContainerModalOptions.hideFooter = true;
    this.upgradeContainerModalOptions = _.cloneDeep(modalCommonOptions);
    this.upgradeContainerModalOptions.title = "Upgrade";
    this.upgradeContainerModalOptions.hideFooter = true;
    this.upgradeProgressModalOptions = _.cloneDeep(modalCommonOptions);
    this.upgradeProgressModalOptions.hideCloseBtn = true;

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
      this.containerId = params['containerId'];
      this.groupInfo = { ID: groupId };
      this._groupService.getById(groupId)
        .then(data => {
          this.groupInfo = data;
          this.servers = [];
          data.Servers.forEach((item: any) => {
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
          this.getContainer();
        })
        .catch(err => {
          messager.error(err);
          this._router.navigate(['/group', this.groupInfo.ID, this.ip, 'overview']);
        });
    });
    this.subscribers.push(paramSub);
  }

  ngOnDestroy() {
    this.subscribers.forEach(item => item.unsubscribe());
  }

  private getContainer() {
    this._containerService.getById(this.ip, this.containerId)
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
        let basicInfo = {
          'Image': data.Config.Image,
          'Pid': data.State.Pid,
          'Hostname': data.Config.Hostname,
          'Command': `${data.Path} ${data.Args.join(' ')}`,
          'Restart Policy': (data.HostConfig.RestartPolicy.Name || "none"),
          'Network Mode': data.HostConfig.NetworkMode.toUpperCase(),
          'CpuShares': data.HostConfig.CpuShares || 'Unlimited',
          'Memory Limit': data.HostConfig.Memory ? `${(data.HostConfig.Memory / 1024 / 1024)} MB` : 'Unlimited',
          'Create Date': moment(data.Created).format('YYYY-MM-DD HH:mm:ss'),
          'Started At': moment(data.State.StartedAt).format('YYYY-MM-DD HH:mm:ss')
        };
        this.containerBasicInfo = [];
        for (let key in basicInfo) {
          this.containerBasicInfo.push({
            title: key,
            content: basicInfo[key]
          });
        }
      })
      .catch(err => {
        messager.error(err.Detail || "Get containers failed.");
        this._router.navigate(['/group', this.groupInfo.ID, this.ip, 'overview']);
      });
  }

  private operate(action: string, event: any) {
    if (event && event.target.classList.contains('disable')) {
      event.stopPropagation();
      return;
    }
    this._containerService.operate(this.ip, this.containerId, action)
      .then(data => {
        messager.success('succeed');
        this._logService.addLog(`${action}ed container ${this.containerId} on ${this.ip}`, 'Container', this.groupInfo.ID, this.ip);
        this.getContainer();
      })
      .catch(err => {
        messager.error(err.message || err);
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
    this._containerService.delete(this.ip, this.containerId, this.forceDeletion)
      .then(data => {
        this._logService.addLog(`Deleted container ${this.containerId} on ${this.ip}`, 'Container', this.groupInfo.ID, this.ip);
        this._router.navigate(["/group", this.groupInfo.ID, this.ip, 'overview']);
      })
      .catch((err) => {
        messager.error(err);
      });
  }

  private showRenameModal() {
    this.renameContainerModalOptions.formSubmitted = false;
    this.renameContainerModalOptions.show = true;
  }

  private rename(form: any) {
    this.renameContainerModalOptions.formSubmitted = true;
    if (form.invalid) return;
    let newName = form.value.newName;
    this._containerService.rename(this.ip, this.containerId, newName)
      .then((data) => {
        form.reset();
        this._logService.addLog(`Renamed container ${this.containerId} to ${newName} on ${this.ip}`, 'Container', this.groupInfo.ID, this.ip);
        messager.success('succeed');
        this.renameContainerModalOptions.show = false;
        this._router.navigate(['/group', this.groupInfo.ID, this.ip, 'containers', newName]);
      })
      .catch((err) => {
        messager.error(err.Detail || err);
      });
  }

  private showUpgradeModal() {
    this.upgradeContainerModalOptions.formSubmitted = false;
    this.upgradeContainerModalOptions.show = true;
  }

  private enableForceDeletion(value: any){
    this.forceDeletion = value.target.checked;
  }

  private refreshSelectedServer(data: any) {
    this.selectedServers = data.value || [];
  }

  private upgrade(form: any) {
    this.upgradeContainerModalOptions.formSubmitted = true;
    if (form.invalid || !this.selectedServers.length) return;
    let destTag = form.value.newTag;
    let image = `${this.container.Config.Image.split(':')[0]}:${destTag}`;

    this.upgradeContainerModalOptions.show = false;
    this.upgradeProgressModalOptions.show = true;
    form.reset();
    this.upgradeProcessMsg = [];
    this.isUpgradeDone = [];
    let self = this;
    for (let server of this.selectedServers) {
      (function (ip: string, image: string, tag: string) {
        let containerId = self.containerId;
        self.addUpgradeMsg(ip, "Begin to pull image", image);
        self._imageService.pullImage(ip, image, true)
          .then(data => {
            self.addUpgradeMsg(ip, "Pulling image done.");
            self.addUpgradeMsg(ip, "Begin to upgrading image...");
            self._containerService.upgradeImage(ip, containerId, tag, true)
              .then(data => {
                self.addUpgradeMsg(ip, "Upgrading image done.");
                self._logService.addLog(`Upgraded container ${self.containerId} from ${self.container.Config.Image} to ${image} on ${ip}`, 'Container', self.groupInfo.ID, ip);
                self.addUpgradeResult(ip, true);
              })
              .catch((err) => {
                let errMsg = err.Detail || JSON.stringify(err);
                self.addUpgradeMsg(ip, "Upgrading image error : " + errMsg);
                self.addUpgradeResult(ip, false);
              })
          })
          .catch((err) => {
            let errMsg = err.Detail || JSON.stringify(err);
            self.addUpgradeMsg(ip, "Pulling image error : " + errMsg);
            self.addUpgradeResult(ip, false);
          })
      })(server, image, destTag);
    }
  }

  private addUpgradeMsg(ip: string, msg: any, image?: string) {
    this.upgradeProcessMsg.push({
      "time": new Date(),
      "server": ip,
      "msg": msg,
      "image": image
    });
  }

  private addUpgradeResult(ip: string, result: boolean) {
    this.isUpgradeDone.push({
      "server": ip,
      "result": result
    });
    if (this.isUpgradeDone.length === this.selectedServers.length) {
      let failed = _.filter(this.isUpgradeDone, (item: any) => {
        return item.result === false;
      });
      let servers = "";
      let msg = "";
      if (failed.length > 0) {
        let temp: Array<any> = [];
        for (let item of failed) {
          temp.push(item.server);
        }
        servers = temp.join(',');
        msg = 'Failed';
      } else {
        servers = "All servers"
        msg = "Succeed!";
      }
      this.addUpgradeMsg(servers, msg);
    }
  }

  private closeUpgradeProgressModal() {
    this.upgradeProgressModalOptions.show = false;
    this.getContainer();
  }
}

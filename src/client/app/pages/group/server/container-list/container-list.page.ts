import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ContainerService, GroupService, ImageService, LogService, ComposeService } from './../../../../services';
import * as fileSaver from 'file-saver';

declare let _: any;
declare let messager: any;

@Component({
  selector: 'hb-container-list',
  templateUrl: './container-list.html',
  styleUrls: ['./container-list.css']
})
export class ContainerListPage {

  private groupInfo: any;
  private ip: any;
  private containers: Array<any> = [];
  private filterContainers: Array<any> = [];
  private filterContainerDone: boolean;
  private containerFilter: string;
  private currentContainers: Array<any> = [];
  private containerPageIndex: number = 1;

  private images: Array<any> = [];
  private filterImages: Array<any> = [];
  private filterImageDone: boolean;
  private imageFilter: string;
  private currentImages: Array<any> = [];
  private imagePageIndex: number = 1;

  private serviceInfo: Array<any> = [];
  private filterServiceDone: boolean;
  private filterServices: Array<any> = [];
  private serviceFilter: string;
  private currentServices: Array<any> = [];
  private servicePageIndex: number = 1;
  private hasFailedContainer: boolean = false;

  private subscribers: Array<any> = [];

  private activedTab: string = 'containers';

  private pageSize: number = 20;
  private containerPageOption: any;

  private rmContainerTarget: any;
  private rmContainerModalOptions: any = {};
  private rmServiceTarget: any;
  private rmServiceModalOptions: any = {};
  private forceDeletion: boolean = false;
  private pullImageModalOptions: any = {};
  private rmImageTarget: any;
  private rmImageModalOptions: any = {};
  private agentInvalid: boolean = false;
  private dockerEngineVersion: string;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _containerService: ContainerService,
    private _composeService: ComposeService,
    private _groupService: GroupService,
    private _imageService: ImageService,
    private _logService: LogService) {

  }

  ngOnInit() {

    this.containerPageOption = {
      "boundaryLinks": false,
      "directionLinks": true,
      "hidenLabel": true
    };
    let modalCommonOptions = {
      title: 'WARN',
      show: false,
      closable: false
    };
    this.rmContainerModalOptions = _.cloneDeep(modalCommonOptions);
    this.rmServiceModalOptions = _.cloneDeep(modalCommonOptions);
    this.pullImageModalOptions = _.cloneDeep(modalCommonOptions);
    this.pullImageModalOptions.hideFooter = true;
    this.pullImageModalOptions.title = 'Pull Docker Image';
    this.rmImageModalOptions = _.cloneDeep(modalCommonOptions);
    let paramSub = this._route.params.subscribe(params => {
      let groupId = params['groupId'];
      this.ip = params['ip'];
      this.groupInfo = { ID: groupId };
      this._groupService.getById(groupId)
        .then(data => {
          this.groupInfo = data;
          this.init();
        })
        .catch(err => {
          messager.error(err);
          this._router.navigate(['/group']);
        });
    });
    this.subscribers.push(paramSub);
  }

  ngOnDestroy() {
    this.subscribers.forEach(item => item.unsubscribe());
  }

  private init() {
    this.containers = [];
    this.filterContainers = [];
    this.filterContainerDone = false;
    this.currentContainers = [];

    this.images = [];
    this.filterImages = [];
    this.filterImageDone = false;
    this.currentImages = [];

    this.serviceInfo = [];
    this.filterServices = [];
    this.filterServiceDone = false;
    this.currentServices = [];

    if(sessionStorage.getItem('serverTab') == 'service'){
      this.activedTab = 'service';
      this.getService();
    }else{
      this.activedTab = 'containers';
      this.getContainers();
    }
  }

  private changeTab(tab: string) {
    this.activedTab = tab;
    if (tab === 'containers' && this.containers.length === 0) {
      this.getContainers();
    }
    if (tab === 'images' && this.images.length === 0) {
      this.getImages();
    }
    if (tab === 'service' && this.serviceInfo.length === 0) {
      this.getService();
    }
    this.agentInvalid = false;
    sessionStorage.setItem('serverTab', tab);
  }

  private getContainers() {
    this.agentInvalid = false;
    this._containerService.get(this.ip)
      .then(data => {
        this.containers = _.sortBy(data, 'Names');
        this.containers = this.containers.filter((item: any) => {
          if (item.Names[0] && item.Names[0].startsWith('/CLUSTER-') || (item.Labels && typeof(item.Labels) == 'object' && JSON.stringify(item.Labels) !== "{}" && item.Labels["com.docker.compose.service"])) {
            return false;
          }
          return true;
        });
        this.filterContainer();
      })
      .catch(err => {
        messager.error(err.message || "Get containers failed");
      });
  }

  private getService() {
    this._composeService.getAgentInfo(this.ip)
      .then(data => {
        if (data.AppVersion >= "1.3.3") {
          this.agentInvalid = false;
          this._composeService.getDockerVersion(this.ip)
            .then(data => {
              this.dockerEngineVersion = data.ServerVersion.Version;
            })
            .catch(err => {
              messager.error(err.message || "Get services failed");
            })
          this._composeService.getService(this.ip)
            .then(data => {
              this.serviceInfo = _.sortBy(data, 'Name');
              this.serviceInfo.forEach(item => {
                item.Containers = item.Containers || [];
                item.Containers = _.sortBy(item.Containers, 'Name');

              });
              this.filterService();
            })
            .catch(err => {
              messager.error(err.message || "Get services failed");
            })
        } else {
          this.agentInvalid = true;
        }
      })
      .catch(err => {
        messager.error(err.message || "Server is no response");
      })
  }

  private getContainerStatus(status: any) {
    let cls = 'success';
    if (status.indexOf('Paused') !== -1 || status.indexOf('Restarting') !== -1 || status === 'Created') {
      cls = 'warning';
      this.hasFailedContainer = true;
    }else{
      //是否存在失败的container
      this.hasFailedContainer = false;
    }
    if (status.startsWith('Exited')) {
      cls = 'danger';
      this.hasFailedContainer = true;
    }else{
      this.hasFailedContainer = false;
    }
    return cls;
  }

  private filterContainerTimeout: any;
  private filterContainer(value?: any) {
    this.containerFilter = value || '';
    if (this.filterContainerTimeout) {
      clearTimeout(this.filterContainerTimeout);
    }
    this.filterContainerTimeout = setTimeout(() => {
      let keyWord = this.containerFilter;
      if (!keyWord) {
        this.filterContainers = this.containers;
      } else {
        let regex = new RegExp(keyWord, 'i');
        this.filterContainers = this.containers.filter(item => {
          return regex.test(item.Names[0]);
        })
      }
      this.setContainerPage(this.containerPageIndex);
      this.filterContainerDone = true;
    }, 100);
  }

  private setContainerPage(pageIndex: number) {
    this.containerPageIndex = pageIndex;
    if (!this.filterContainers) return;
    let start = (pageIndex - 1) * this.pageSize;
    let end = start + this.pageSize;
    this.currentContainers = this.filterContainers.slice(start, end);
  }

  private getStatsCls(status: string) {
    let cls = 'success';
    if (status.indexOf('Paused') !== -1 || status.indexOf('Restarting') !== -1 || status === 'Created') {
      cls = 'warning';
    }
    if (status.startsWith('Exited')) {
      cls = 'danger';
    }
    return cls;
  }

  private operate(container: any, action: string) {
    let id = container.Id.substring(0, 14);
    let name = container.Names[0].substring(1);
    this._containerService.operate(this.ip, id, action)
      .then(data => {
        messager.success('succeed');
        this._logService.addLog(`${action}ed container ${name} on ${this.ip}`, 'Container', this.groupInfo.ID, this.ip);
        this.getContainers();
      })
      .catch(err => {
        messager.error(err.Detail || err);
      });
  }

  private showRmContainerModal(container: any) {
    this.rmContainerTarget = container;
    this.rmContainerModalOptions.show = true;
  }

  private enableForceDeletion(value: any) {
    this.forceDeletion = value.target.checked;
  }

  private rmContainer() {
    let id = this.rmContainerTarget.Id.substring(0, 14);
    let name = this.rmContainerTarget.Names[0].substring(1);
    this._containerService.delete(this.ip, id, this.forceDeletion)
      .then((data) => {
        messager.success('succeed');
        this._logService.addLog(`Deleted container ${name} on ${this.ip}`, 'Container', this.groupInfo.ID, this.ip);
        this.rmContainerModalOptions.show = false;
        this.getContainers();
      })
      .catch((err) => {
        messager.error(err.Detail || err);
      })
  }

  private getImages() {
    this._imageService.getImages(this.ip)
      .then(data => {
        this.images = []; 
        data.forEach((item: any) => {
          if (!item.RepoTags){
            return;
          }
          let isDuplicatedImage = item.RepoTags.length > 1;
          item.RepoTags.forEach((repo: any) => {
            let temp = {
              _repo: repo,
              Id: item.Id,
              Name: repo.split(':')[0],
              Tag: repo.split(':')[1],
              VirtualSize: (item.VirtualSize / 1024 / 1024).toFixed(),
              Created: item.Created * 1000,
              isDuplicatedImage: isDuplicatedImage
            };
            this.images.push(temp);
          });
        });
        this.images = _.sortBy(this.images, 'Name');
        this.filterImage();
      })
      .catch((err) => {
        messager.error(err.Detail || "Get images failed");
      });
  }

  private filterImageTimeout: any;
  private filterImage(value?: any) {
    this.imageFilter = value || '';
    if (this.filterImageTimeout) {
      clearTimeout(this.filterImageTimeout);
    }
    this.filterImageTimeout = setTimeout(() => {
      let keyWord = this.imageFilter;
      if (!keyWord) {
        this.filterImages = this.images;
      } else {
        let regex = new RegExp(keyWord, 'i');
        this.filterImages = this.images.filter(item => {
          return regex.test(item.Name);
        })
      }
      this.setImagePage(this.imagePageIndex);
      this.filterImageDone = true;
    }, 100);
  }

  private setImagePage(pageIndex: number) {
    this.imagePageIndex = pageIndex;
    if (!this.filterImages) return;
    let start = (pageIndex - 1) * this.pageSize;
    let end = start + this.pageSize;
    this.currentImages = this.filterImages.slice(start, end);
  }

  private filterServiceTimeout: any;
  private filterService(value?: any) {
    this.serviceFilter = value || '';
    if (this.filterServiceTimeout) {
      clearTimeout(this.filterServiceTimeout);
    }
    this.filterServiceTimeout = setTimeout(() => {
      let keyWord = this.serviceFilter;
      if (!keyWord) {
        this.filterServices = this.serviceInfo;
      } else {
        let regex = new RegExp(keyWord, 'i');
        this.filterServices = this.serviceInfo.filter(item => {
          return regex.test(item.Name);
        })
      }
      this.setServicePage(this.servicePageIndex);
      this.filterServiceDone = true;
    }, 100);
  }

  private setServicePage(pageIndex: number) {
    this.servicePageIndex = pageIndex;
    if (!this.filterServices) return;
    let start = (pageIndex - 1) * this.pageSize;
    let end = start + this.pageSize;
    this.currentServices = this.filterServices.slice(start, end);
  }

  private showPullImageModal() {
    this.pullImageModalOptions.formSubmitted = false;
    this.pullImageModalOptions.show = true;
  }

  private pullImage(form: any) {
    this.pullImageModalOptions.formSubmitted = true;
    if (form.invalid) return;
    let imageName = form.value.pullImageName;
    if (!imageName) {
      messager.error('Image name cannot be empty or null');
      return;
    }
    let regex = new RegExp('^[0-9a-zA-Z-_:./]+$');
    if (!regex.test(imageName)) {
      messager.error('Image name cannot contain any special character');
      return;
    }
    this.pullImageModalOptions.show = false;
    this._imageService.pullImage(this.ip, imageName)
      .then(data => {
        messager.success('succeed');
        this._logService.addLog(`Pulled image ${imageName} on ${this.ip}`, 'Image', this.groupInfo.ID, this.ip);
        this.pullImageModalOptions.show = false;
        this.getImages();
      })
      .catch(err => {
        messager.error(err.Detail || err);
      });
  }

  private showRmImageModal(image: any) {
    this.rmImageTarget = image;
    this.rmImageModalOptions.show = true;
  }

  private rmImage() {
    let id = this.rmImageTarget.Id.substring(0, 14);
    if (this.rmImageTarget.isDuplicatedImage) {
      id = this.rmImageTarget._repo;
    }
    this.rmImageModalOptions.show = false;
    this._imageService.deleteImage(this.ip, id)
      .then(data => {
        messager.success('succeed');
        this._logService.addLog(`Deleted image ${this.rmImageTarget._repo} on ${this.ip}`, 'Image', this.groupInfo.ID, this.ip);
        this.getImages();
      })
      .catch(err => {
        messager.error(err.Detail || err);
      });
  }

  private serviceOperate(service: any, action: any) {
    this._composeService.ComposeOperate(this.ip, service.Name, action)
      .then(data => {
        messager.success('succeed');
        // this._logService.addLog(`${action}ed container ${name} on ${this.ip}`, 'Container', this.groupInfo.ID, this.ip);
        this.getService();
      })
      .catch(err => {
        messager.error(err.Detail || err);
      });
  }

  private showRmServiceModal(service: any) {
    this.rmServiceTarget = service;
    this.rmServiceModalOptions.show = true;
  }

  private rmService() {
    let name = this.rmServiceTarget.Name;
    this._composeService.removeService(this.ip, name)
      .then((data) => {
        messager.success('succeed');
        this.rmServiceModalOptions.show = false;
        this.getService();
      })
      .catch((err) => {
        messager.error(err.Detail || err);
      })
  }

  private downloadComposeData(item: any) {
    let content = item.ComposeData;
    let blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    fileSaver.saveAs(blob, `${item.Name}.yml`)
  }

  copyId(cIdInput: HTMLInputElement) {
    if (cIdInput) {
      cIdInput.select();
      document.execCommand('Copy');
      messager.success('Copied');
    }
  }
}

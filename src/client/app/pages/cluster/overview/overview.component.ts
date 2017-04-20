import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService, ContainerService, LogService, ClusterService, HubService } from './../../../services';

declare let _: any;
declare let messager: any;

@Component({
	selector: 'overview',
	templateUrl: 'overview.component.html',
	styleUrls: ['./overview.component.css']
})

export class ClusterOverviewPage {

	private groupInfo: any = {};
	private containerFilter: string;
	private containers: Array<any> = [];
	private filterContainers: Array<any> = [];
	private filterContainerDone: boolean;
	private currentContainers: Array<any> = [];
	private containerPageOption: any;
	private containerPageIndex: number = 1;
	private pageSize: number = 15;

	private rmContainerTarget: any;
	private rmContainerModalOptions: any = {};
	private reAssignTarget: any;
	private reAssignConfirmModalOptions: any = {};

	private selectTag: string;
	private candidateTags: Array<any> = [];

	private upgradeContainerTarget: any;
	private upgradeContainerModalOptions: any = {};

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _containerService: ContainerService,
		private _groupService: GroupService,
		private _logService: LogService,
		private _clusterService: ClusterService,
		private _hubService: HubService) {

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
		this.upgradeContainerModalOptions = _.cloneDeep(modalCommonOptions);
		this.upgradeContainerModalOptions.title = "Upgrade";
		this.upgradeContainerModalOptions.hideFooter = true;
		this.reAssignConfirmModalOptions = _.cloneDeep(modalCommonOptions);

		this._route.params.forEach(params => {
			let groupId = params['groupId'];
			this.groupInfo.ID = groupId;
			this._groupService.getById(groupId)
				.then(data => {
					this.groupInfo = data;
					this.getContainers();
				})
		});
	}

	private getContainers() {
		this._clusterService.getClusterContainers(this.groupInfo.ID)
			.then(data => {
				data = data.Data.Containers || [];
				this.containers = _.sortBy(data, 'Config.Name');
				this.containers.forEach(item => {
					item.Containers = item.Containers || [];
					item.Containers = _.sortBy(item.Containers, ['IP', "HostName"]);
					item.IpTables = {};
					item.Running = 0;
					item.Stopped = 0;
					item.Containers.forEach((subItem: any) => {
						if (!item.IpTables[subItem.IP]) item.IpTables[subItem.IP] = { Running: 0, Stopped: 0 };
						let stateText = '';
						if (subItem.Container.Status.Running) {
							stateText = 'Running';
							item.IpTables[subItem.IP].Running++;
							item.Running++;
						} else {
							stateText = 'Stopped';
							item.IpTables[subItem.IP].Stopped++;
							item.Stopped++;
						}
						if (subItem.Container.Status.Restarting) {
							stateText = 'Restarting';
						}
						if (subItem.Container.Status.Paused) {
							stateText = 'Paused';
						}
						if (subItem.Container.Status.Dead) {
							stateText = 'Dead';
						}
						subItem.Container.Status.StatusText = stateText;
					});

				});
				this.filterContainer();
			})
			.catch(err => {
				messager.error(err.message || "Get containers failed");
			});
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
					return regex.test(item.Config.Name);
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

	private getStatsCls(status: any) {
		let cls = 'success';
		if (status.Dead || !status.Running) {
			cls = 'danger';
		}
		if (status.Paused || status.Restarting) {
			cls = 'yellow';
		}
		return cls;
	}

	private operate(container: any, action: string) {
		this._clusterService.operate(container.MetaId, action)
			.then(data => {
				messager.success('succeed');
				this._logService.addLog(`${action} container ${container.Config.Name} on ${this.groupInfo.Name}`, 'Cluster', this.groupInfo.ID);
				this.getContainers();
			})
			.catch(err => {
				messager.error(err);
			});
	}

	private showReAssignConfirm(target: any) {
		this.reAssignTarget = target;
		this.reAssignConfirmModalOptions.show = true;
	}

	private reAssign() {
		messager.error('not implement');
	}

	private showRmContainerModal(container: any) {
		this.rmContainerTarget = container;
		this.rmContainerModalOptions.show = true;
	}

	private rmContainer() {
		this.rmContainerModalOptions.show = false;
		let name = this.rmContainerTarget.Config.Name;
		this._clusterService.deleteContainer(this.rmContainerTarget.MetaId)
			.then(data => {
				this._logService.addLog(`Deleted container ${name} on ${this.groupInfo.Name}`, 'Cluster', this.groupInfo.ID);
				this.getContainers();
			})
			.catch((err) => {
				messager.error(err);
			});
	}

	private showUpgradeModal(target: any) {
		this.upgradeContainerTarget = target;
		this.selectTag = '';
		let imageName = this.upgradeContainerTarget.Config.Image.replace(`${this.groupInfo.RegistryAdd}/`, '');
		imageName = imageName.split(':')[0];
		this._hubService.getTags(this.groupInfo.RegistryLocation, imageName, true)
			.then(data => {
				this.candidateTags = data;
				this.upgradeContainerModalOptions.formSubmitted = false;
				this.upgradeContainerModalOptions.show = true;
			})
			.catch(err => {
				messager.error("Get tags failed. Please try again.")
			});
	}

	private upgrade(form: any) {
		this.upgradeContainerModalOptions.formSubmitted = true;
		if (form.invalid) return;
		let newImage = `${this.upgradeContainerTarget.Config.Image.split(':')[0]}:${form.value.newTag}`;
		this._clusterService.upgradeImage(this.upgradeContainerTarget.MetaId, form.value.newTag)
			.then(res => {
				messager.success('succeed');
				this.upgradeContainerModalOptions.show = false;
				this._logService.addLog(`Upgrade container ${this.upgradeContainerTarget.Config.Name} from ${this.upgradeContainerTarget.Config.Image} to ${newImage} on ${this.groupInfo.Name}`, 'Cluster', this.groupInfo.ID);
				this.getContainers();
			})
			.catch(err => messager.error(err));
	}
}
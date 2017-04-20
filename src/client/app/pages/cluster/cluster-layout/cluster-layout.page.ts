import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, RoutesRecognized } from '@angular/router';
import { GroupService } from './../../../services';

declare let $: any;
declare let _: any;
declare let messager: any;

@Component({
  selector: 'hb-cluster-layout',
  templateUrl: './cluster-layout.html',
  styleUrls: ['./cluster-layout.css']
})
export class ClusterLayoutPage {

  @ViewChild('groupTreePanel')
  private groupTreePanel: ElementRef;

  private selectedGroupId: any;
  private groups: Array<any>;
  private getGroupDone: boolean;

  private routerEventSubscriber: any;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _groupService: GroupService) {

  }

  ngOnInit() {
    let guidRex = /^[0-9a-z]{8,8}-[0-9a-z]{4,4}-[0-9a-z]{4,4}-[0-9a-z]{4,4}-[0-9a-z]{12,12}$/;
    this.routerEventSubscriber = this._router.events.subscribe(s => {
      if (s instanceof NavigationEnd) {
        $('body').scrollTop(0);
        let currentUrl = this._router.url.toLowerCase();
        let paths = currentUrl.split('/');
        for (let path of paths) {
          if (!path) continue;
          if (guidRex.test(path)) {
            this.selectedGroupId = path;
            break;
          }
        }
      }
    });

  }

  ngOnDestroy() {
    if (this.routerEventSubscriber) {
      this.routerEventSubscriber.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this._groupService.get(true, 'cluster')
      .then(groups => {
        this.getGroupDone = true;
        this.groups = groups;
        this.fixGroupTreePanel();
        $(window, ".wrapper").resize(() => {
          this.fixGroupTreePanel();
        });
      })
      .catch(err => {
        messager.error(err);
        this._router.navigate(['/']);
      });
  }

  private fixGroupTreePanel() {
    let panel = this.groupTreePanel.nativeElement;
    $(panel).slimScroll({ destroy: true }).height("auto");
    $(panel).slimscroll({
      height: ($(window).height() - $(".main-header").height()) + "px",
      color: "rgba(255,255,255,0.7)",
      size: "3px"
    });
  }
}
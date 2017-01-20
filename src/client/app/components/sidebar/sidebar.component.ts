import { Component, ViewChild, ElementRef, Renderer } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from './../../app.config';
import { AuthService, EventNotifyService } from './../../services';

declare let $: any;
declare let messager: any;

@Component({
  selector: 'hb-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})

export class SideBarComponent {

  @ViewChild('mainSidebar')
  private mainSidebar: ElementRef;
  private sideBar: HTMLElement;

  private groups: Array<Object>;
  private userInfo: any;

  private activeSubMenu: string = '';

  constructor(
    private _router: Router,
    private _renderer: Renderer,
    private _authService: AuthService,
    private _eventNotifyService: EventNotifyService) {
  }

  ngOnInit() {
    this.userInfo = this._authService.getUserInfoFromCache();
    this._eventNotifyService.subscribe(AppConfig.EventName.SidebarMini, (state: any) => {
      if (window.innerWidth < 767) {
        state = !state;
      }
      if (state) {
        $(this.sideBar).slimScroll({ destroy: true }).height("auto");
        this.sideBar.style.overflow = null;
      } else {
        this.fixSidebar();
      }
    });
    let currentUrl = this._router.url;
    if (currentUrl.startsWith('/account')) {
      this.activeSubMenu = 'account';
    } else if (currentUrl.startsWith('/manage')) {
      this.activeSubMenu = 'manage';
    }
  }

  ngAfterViewInit() {
    this.sideBar = this.mainSidebar.nativeElement.querySelector('.sidebar');
    $(window, ".wrapper").resize(() => {
      this.fixSidebar();
    });
    this.fixSidebar();
  }

  private fixSidebar() {
    $(this.sideBar).slimScroll({ destroy: true }).height("auto");
    $(this.sideBar).slimscroll({
      height: ($(window).height() - $(".main-header").height()) + "px",
      color: "rgba(255,255,255,0.7)",
      size: "3px"
    });
  }

  private toggleSubMenu(element: HTMLElement, subMenuName: string) {
    if (this.activeSubMenu === subMenuName) {
      this.activeSubMenu = '';
    } else {
      this.activeSubMenu = subMenuName;
    }
    let isActive = element.classList.contains('active');
    this._renderer.setElementClass(element, 'active', !isActive);
  }
}
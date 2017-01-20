import { IsLogin, IsGroupOwner } from './auth-guard.service';
import { AuthService } from './auth.service';
import { GroupService } from './group.service';
import { DashboardService } from './dashboard.service';
import { ContainerService } from './container.service';
import { ImageService } from './image.service';
import { HubService } from './hub.service';
import { CusHttpService } from './custom-http.service';
import { GlobalLoadingService } from './global-loading.service';
import { LogService } from './log.service';
import { MostUsedService } from './most-used.service';
import { EventNotifyService } from './event-notify.service';
import { UserService } from './user.service';

export * from './auth-guard.service';
export * from './auth.service';
export * from './group.service';
export * from './dashboard.service';
export * from './container.service';
export * from './image.service';
export * from './hub.service';
export * from './custom-http.service';
export * from './global-loading.service';
export * from './log.service';
export * from './most-used.service';
export * from './event-notify.service';
export * from './user.service';

let Services: Array<any> = [
  IsLogin,
  IsGroupOwner,
  AuthService,
  GroupService,
  DashboardService,
  ContainerService,
  ImageService,
  HubService,
  CusHttpService,
  GlobalLoadingService,
  LogService,
  MostUsedService,
  EventNotifyService,
  UserService
]

export const SERVICES = Services;
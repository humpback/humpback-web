import { ContainerListPage } from './container-list';
import { ContainerDetailPage } from './container-detail';
import { ContainerNewPage } from './container-new';
import { ContainerClonePage } from './container-clone';
import { ContainerMonitorPage } from './container-monitor';
import { ContainerLogPage } from './container-log';

export * from './container-list';
export * from './container-detail';
export * from './container-new';
export * from './container-clone';
export * from './container-monitor';
export * from './container-log';

export const SERVERPAGES: Array<any> = [
  ContainerListPage,
  ContainerDetailPage,
  ContainerNewPage,
  ContainerClonePage,
  ContainerMonitorPage,
  ContainerLogPage
]
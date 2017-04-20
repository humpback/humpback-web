import { ClusterLayoutPage } from './cluster-layout/cluster-layout.page';
import { ClusterOverviewPage } from './overview/overview.component';
import { ClusterContainerEditPage } from './container-edit/container-edit.page';
import { ClusterContainerInfoPage } from './container-info/container-info.page';

export {
  ClusterLayoutPage,
  ClusterOverviewPage,
  ClusterContainerEditPage,
  ClusterContainerInfoPage
}

export const CLUSTERPAGES: Array<any> = [
  ClusterLayoutPage,
  ClusterOverviewPage,
  ClusterContainerEditPage,
  ClusterContainerInfoPage
]
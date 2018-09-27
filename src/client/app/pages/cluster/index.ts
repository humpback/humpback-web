import { ClusterLayoutPage } from './cluster-layout/cluster-layout.page';
import { ClusterOverviewPage } from './overview/overview.component';
import { ClusterContainerEditPage } from './container-edit/container-edit.page';
import { ClusterContainerInfoPage } from './container-info/container-info.page';
import { ClusterNodePage } from './cluster-node/cluster-node.page';

export {
  ClusterLayoutPage,
  ClusterOverviewPage,
  ClusterContainerEditPage,
  ClusterContainerInfoPage,
  ClusterNodePage
}

export const CLUSTERPAGES: Array<any> = [
  ClusterLayoutPage,
  ClusterOverviewPage,
  ClusterContainerEditPage,
  ClusterContainerInfoPage,
  ClusterNodePage
]

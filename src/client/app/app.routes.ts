import { Routes, RouterModule } from '@angular/router';

import { IsLogin, IsGroupOwner } from './services';
import { GroupResolve, SystemConfigResolve } from './resolves';
import {
  RootLayoutPage,
  DashboardPage,
  LoginPage,
  GroupLayoutPage, GroupOverviewPage, ContainerListPage, ContainerDetailPage, ContainerNewPage, ContainerClonePage, ContainerMonitorPage, ContainerLogPage,
  ClusterLayoutPage, ClusterOverviewPage, ClusterContainerEditPage, ClusterContainerInfoPage,
  HubHomePage, ImageOverviewPage, EditImageDescriptionPage,
  ActivityPage,
  ManageGroupListPage, ManageGroupEditPage, ManageUserListPage, ManageUserEditPage,
  UserProfilePage, ChangePasswordPage,
  SystemConfigPage,
  NotFoundPage, UnAuthorizedPage
} from './pages';

let routes: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: '', component: RootLayoutPage, canActivate: [IsLogin], canActivateChild: [IsLogin],
    resolve: { config: SystemConfigResolve },
    children: [
      { path: '', component: DashboardPage },
      { path: 'dashboard', redirectTo: '/' },
      {
        path: 'group', component: GroupLayoutPage, canActivateChild: [IsGroupOwner],
        resolve: { groups: GroupResolve },
        children: [
          { path: ':groupId/overview', component: GroupOverviewPage },
          { path: ':groupId/:ip/overview', component: ContainerListPage },
          { path: ':groupId/:ip/new-container', component: ContainerNewPage },
          { path: ':groupId/:ip/containers/:containerId', component: ContainerDetailPage },
          { path: ':groupId/:ip/containers/:containerId/clone', component: ContainerClonePage },
          { path: ':groupId/:ip/containers/:containerId/monitor', component: ContainerMonitorPage },
          { path: ':groupId/:ip/containers/:containerId/logs', component: ContainerLogPage }
        ]
      },
      {
        path: 'cluster', component: ClusterLayoutPage, canActivateChild: [IsGroupOwner], data: { GroupType: 'cluster' },
        children: [
          { path: ':groupId/overview', component: ClusterOverviewPage },
          { path: ':groupId/new-container', component: ClusterContainerEditPage, data: { IsNew: true } },
          { path: ':groupId/containers/:metaId/clone', component: ClusterContainerEditPage, data: { IsClone: true } },
          { path: ':groupId/containers/:metaId/info', component: ClusterContainerInfoPage }
        ]
      },

      { path: 'hub', component: HubHomePage },
      { path: 'hub/_/:imageId/overview', component: ImageOverviewPage },
      { path: 'hub/_/:imageId/edit/description', component: EditImageDescriptionPage },

      { path: 'activity', component: ActivityPage },

      { path: 'manage/groups', component: ManageGroupListPage },
      { path: 'manage/groups/add-group', component: ManageGroupEditPage, data: { Admin: true } },
      { path: 'manage/groups/:groupId/edit', component: ManageGroupEditPage },
      { path: 'manage/users', component: ManageUserListPage, data: { Admin: true } },
      { path: 'manage/users/add-user', component: ManageUserEditPage, data: { Admin: true } },
      { path: 'manage/users/:userId/edit', component: ManageUserEditPage, data: { Admin: true } },
      { path: 'manage/system-config', component: SystemConfigPage, data: { Admin: true } },

      { path: 'account/profile', component: UserProfilePage },
      { path: 'account/change-password', component: ChangePasswordPage },

      { path: '401', component: UnAuthorizedPage },
      { path: '404', component: NotFoundPage },
      { path: '**', component: NotFoundPage }
    ]
  }
];

export const AppRouting = RouterModule.forRoot(routes, { useHash: false });

import { ManageUserListPage } from './user-list/user-list.page';
import { ManageUserEditPage } from './user-edit/user-edit.page';

export * from './user-list/user-list.page';
export * from './user-edit/user-edit.page';

export const MANAGEUSERPAGES: Array<any> = [
  ManageUserListPage,
  ManageUserEditPage
]
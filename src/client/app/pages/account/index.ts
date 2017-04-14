import { UserProfilePage } from './profile/profile.page';
import { ChangePasswordPage } from './change-password/change-password.page';

export * from './profile/profile.page';
export * from './change-password/change-password.page';

export const ACCOUNTPAGES: Array<any> = [
  UserProfilePage,
  ChangePasswordPage
]
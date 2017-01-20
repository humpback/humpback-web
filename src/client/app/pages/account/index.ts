import { UserProfilePage } from './profile';
import { ChangePasswordPage } from './change-password';

export * from './profile';
export * from './change-password';

export const ACCOUNTPAGES: Array<any> = [
  UserProfilePage,
  ChangePasswordPage
]
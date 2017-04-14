import { MANAGEGROUPPAGES } from './groups';
import { MANAGEUSERPAGES } from './users';
import { SystemConfigPage } from './system-config/system-config.page';

export * from './groups';
export * from './users';
export * from './system-config/system-config.page';

export const MANAGEPAGES: Array<any> = [
  ...MANAGEGROUPPAGES,
  ...MANAGEUSERPAGES,
  SystemConfigPage
]
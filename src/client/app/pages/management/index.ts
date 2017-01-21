import { MANAGEGROUPPAGES } from './groups';
import { MANAGEUSERPAGES } from './users';
import { SystemConfigPage } from './system-config';

export * from './groups';
export * from './users';
export * from './system-config';

export const MANAGEPAGES: Array<any> = [
  ...MANAGEGROUPPAGES,
  ...MANAGEUSERPAGES,
  SystemConfigPage
]
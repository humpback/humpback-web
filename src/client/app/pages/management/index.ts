import { MANAGEGROUPPAGES } from './groups';
import { MANAGEUSERPAGES } from './users';

export * from './groups';
export * from './users';

export const MANAGEPAGES: Array<any> = [
  ...MANAGEGROUPPAGES,
  ...MANAGEUSERPAGES
]
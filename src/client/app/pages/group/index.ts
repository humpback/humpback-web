import { GroupLayoutPage } from './group-layout';
import { GroupOverviewPage } from './overview';
import { SERVERPAGES } from './server';

export * from './group-layout';
export * from './overview';
export * from './server';

export const GROUPPAGES: Array<any> = [
  GroupLayoutPage,
  GroupOverviewPage,
  ...SERVERPAGES
]
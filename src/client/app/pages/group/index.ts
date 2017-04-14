import { GroupLayoutPage } from './group-layout/group-layout.page';
import { GroupOverviewPage } from './overview/overview.page';
import { SERVERPAGES } from './server';

export * from './group-layout/group-layout.page';
export * from './overview/overview.page';
export * from './server';

export const GROUPPAGES: Array<any> = [
  GroupLayoutPage,
  GroupOverviewPage,
  ...SERVERPAGES
]
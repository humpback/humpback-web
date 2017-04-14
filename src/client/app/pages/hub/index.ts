import { HubHomePage } from './hub-home/hub-home.page';
import { IMAGEPAGES } from './image';

export * from './hub-home/hub-home.page';
export * from './image';

export const HUBPAGES: Array<any> = [
  HubHomePage,
  ...IMAGEPAGES
]
import { HubHomePage } from './hub-home';
import { IMAGEPAGES } from './image';

export * from './hub-home';
export * from './image';

export const HUBPAGES: Array<any> = [
  HubHomePage,
  ...IMAGEPAGES
]
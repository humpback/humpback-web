import { GroupResolve } from './group.resolve';
import { SystemConfigResolve } from './system-config.resolve';

export * from './group.resolve';
export * from './system-config.resolve';

let Resolves: Array<any> = [
  GroupResolve,
  SystemConfigResolve
]

export const RESOLVES = Resolves;
import { GroupResolve } from './group.resolve';

export * from './group.resolve';

let Resolves: Array<any> = [
  GroupResolve
]

export const RESOLVES = Resolves;
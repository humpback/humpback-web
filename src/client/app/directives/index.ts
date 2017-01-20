import { AutoScrollDirective } from './auto-scroll';
import { RouterActiveDirective } from './router-active';

export * from './auto-scroll';
export * from './router-active';

let Directives: Array<any> = [
  AutoScrollDirective,
  RouterActiveDirective
]

export const DIRECTIVES = Directives;
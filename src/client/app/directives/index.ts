import { AutoScrollDirective } from './auto-scroll/auto-scroll.directive';
import { RouterActiveDirective } from './router-active/router-active.directive';

export * from './auto-scroll/auto-scroll.directive';
export * from './router-active/router-active.directive';

let Directives: Array<any> = [
  AutoScrollDirective,
  RouterActiveDirective
]

export const DIRECTIVES = Directives;
import { HeaderComponent } from './header';
import { SideBarComponent } from './sidebar';
import { ModalComponent, ModalHeaderComponent, ModalFooterComponent } from './modal';
import { PaginationComponent } from './pagination';
import { TagsInputComponent } from './tags-input';

export * from './header';
export * from './sidebar';
export * from './modal';
export * from './pagination';
export * from './tags-input';

let Components: Array<any> = [
  HeaderComponent,
  SideBarComponent,
  ModalComponent,
  ModalHeaderComponent,
  ModalFooterComponent,
  PaginationComponent,
  TagsInputComponent
]

export const COMPONENTS = Components;
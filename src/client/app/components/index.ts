import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './sidebar/sidebar.component';
import { ModalComponent, ModalHeaderComponent, ModalFooterComponent } from './modal/modal.cpmponent';
import { PaginationComponent } from './pagination/pagination.component';
import { TagsInputComponent } from './tags-input/tags-input.component';

let Components: Array<any> = [
  HeaderComponent,
  SideBarComponent,
  ModalComponent,
  ModalHeaderComponent,
  ModalFooterComponent,
  PaginationComponent,
  TagsInputComponent
]

export {
  HeaderComponent,
  SideBarComponent,
  ModalComponent,
  ModalHeaderComponent,
  ModalFooterComponent,
  PaginationComponent,
  TagsInputComponent
}

export const COMPONENTS = Components;
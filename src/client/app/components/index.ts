import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './sidebar/sidebar.component';
import { ModalComponent, ModalHeaderComponent, ModalFooterComponent } from './modal/modal.cpmponent';
import { PaginationComponent } from './pagination/pagination.component';
import { TagsInputComponent } from './tags-input/tags-input.component';
import { AceEditorComponent } from './ace-editor/ace-editor.component';

let Components: Array<any> = [
  HeaderComponent,
  SideBarComponent,
  AceEditorComponent,
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

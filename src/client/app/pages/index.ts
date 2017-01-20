import { NgModule } from '@angular/core';
import { RootLayoutPage } from './root-layout';
import { DashboardPage } from './dashboard';
import { LoginPage } from './login';
import { GROUPPAGES } from './group'
import { HUBPAGES } from './hub';
import { ActivityPage } from './activity';
import { MANAGEPAGES } from './management';
import { ACCOUNTPAGES } from './account';
import { NotFoundPage } from './not-found';

export * from './root-layout';
export * from './dashboard';
export * from './login';
export * from './group';
export * from './hub';
export * from './activity';
export * from './management';
export * from './account';
export * from './not-found';

let Pages: Array<any> = [
  RootLayoutPage,
  DashboardPage,
  LoginPage,
  ...GROUPPAGES,
  ...HUBPAGES,
  ActivityPage,
  ...MANAGEPAGES,
  ...ACCOUNTPAGES,
  NotFoundPage
]

export const PAGES = Pages;

@NgModule({
  declarations: Pages,
  exports: Pages
})
export class PagesModule { }
import { NgModule } from '@angular/core';
import { RootLayoutPage } from './root-layout/root-layout.page';
import { DashboardPage } from './dashboard/dashboard.page';
import { LoginPage } from './login/login.page';
import { CLUSTERPAGES } from './cluster';
import { GROUPPAGES } from './group'
import { HUBPAGES } from './hub';
import { ActivityPage } from './activity/activity.page';
import { MANAGEPAGES } from './management';
import { ACCOUNTPAGES } from './account';
import { COMMONPAGES } from './common';

export * from './root-layout/root-layout.page';
export * from './dashboard/dashboard.page';
export * from './login/login.page';
export * from './group';
export * from './cluster';
export * from './hub';
export * from './activity/activity.page';
export * from './management';
export * from './account';
export * from './common';

let Pages: Array<any> = [
  RootLayoutPage,
  DashboardPage,
  LoginPage,
  ...GROUPPAGES,
  ...CLUSTERPAGES,
  ...HUBPAGES,
  ActivityPage,
  ...MANAGEPAGES,
  ...ACCOUNTPAGES,
  ...COMMONPAGES
]

export const PAGES = Pages;

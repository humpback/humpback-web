import { enableProdMode, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { Select2Module } from 'ng2-select2';

import { HumpbackApp } from './app';
import { PAGES } from './pages';
import { COMPONENTS } from './components';
import { DIRECTIVES } from './directives';
import { PIPES } from './pipes';
import { CUSTOM_VALIDATORS } from './validators';
import { SERVICES } from './services';
import { RESOLVES } from './resolves';
import { AppRouting } from './app.routes';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpModule,
    AppRouting,
    Select2Module
  ],
  declarations: [
    HumpbackApp,
    ...PAGES,
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES,
    ...CUSTOM_VALIDATORS
  ],
  providers: [
    ...SERVICES,
    ...RESOLVES
  ],
  bootstrap: [HumpbackApp],
})
export class AppModule { }
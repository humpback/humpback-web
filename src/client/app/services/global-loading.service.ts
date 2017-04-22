import { Injectable } from '@angular/core';

@Injectable()
export class GlobalLoadingService {
  private loadingEl: HTMLDivElement;
  private count: number = 0;
  private timmer: any;

  constructor() {
    this.loadingEl = <HTMLDivElement>document.getElementById('globalLoading');
  }

  add() {
    this.count++;
    if (this.count > 0) {
      this.show();
    }
  }

  sub() {
    this.count--;
    if (this.count <= 0) {
      this.count = 0;
      if (this.timmer) clearTimeout(this.timmer);
      this.timmer = setTimeout(() => this.hide(), 0);
    }
  }

  show() {
    this.loadingEl.classList.add('showLoading');
    document.body.style.overflowY = 'hidden';
  }

  hide() {
    setTimeout(() => {
      if (this.count > 0) return;
      this.loadingEl.classList.remove('showLoading');
      document.body.style.overflowY = 'auto';
    }, 100);
  }

  isOpen(): boolean {
    return this.loadingEl.classList.contains('showLoading');
  }
}

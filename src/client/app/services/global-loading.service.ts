import { Injectable } from '@angular/core';

@Injectable()
export class GlobalLoadingService {
  private loadingEl: HTMLDivElement;
  private count: number = 0;

  constructor() {
    this.loadingEl = <HTMLDivElement>document.getElementById('globalLoading');
  }

  add() {
    this.count++;
    if (this.count === 1) {
      this.show();
    }
  }

  sub() {
    this.count--;
    if (this.count <= 0) {
      this.count = 0;
      this.hide();
    }
  }

  show() {
    this.loadingEl.classList.add('showLoading');
    document.body.style.overflowY = 'hidden';
  }

  hide() {
    setTimeout(() => {
      this.loadingEl.classList.remove('showLoading');
      document.body.style.overflowY = 'auto';
    }, 300);
  }

  isOpen(): boolean {
    return this.loadingEl.classList.contains('showLoading');
  }
}
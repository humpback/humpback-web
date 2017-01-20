import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[auto-scroll]'
})
export class AutoScrollDirective {
  public el: any;
  private _observer: any;
  private _oldScrollHeight: number = 0;

  constructor(private _el: ElementRef) {
    this.el = _el.nativeElement;
  }

  ngAfterContentInit() {
    this.el.scrollTop = this.el.scrollHeight;

    // create an observer instance
    this._observer = new MutationObserver((mutations) => {
      this._oldScrollHeight = this.el.scrollHeight;
      this.el.scrollTop = this.el.scrollHeight;
    });

    // configuration of the observer:
    var config = { childList: true, subtree: true };
    var target = this.el;

    // pass in the target node, as well as the observer options
    this._observer.observe(target, config);
  }

  ngOnDestroy() {
    this._observer.disconnect();
  }
}
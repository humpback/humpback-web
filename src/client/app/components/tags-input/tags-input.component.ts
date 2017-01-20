import { Component, ViewChild, ElementRef, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, Validators, ValidatorFn, FormControl } from '@angular/forms';

declare let $: any;

@Component({
  selector: 'hb-tags-input',
  templateUrl: './tags-input.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TagsInputComponent),
    multi: true
  }]
})
export class TagsInputComponent implements ControlValueAccessor {

  @ViewChild('tagsInput')
  private tagsInput: ElementRef;

  @Input()
  validatePattern: string;

  private validateReg: RegExp;
  private tags: Array<any>;

  private _onChange = (_: any) => { };
  private _onTouched = () => { };

  constructor() { }

  ngOnInit() {
    this.validateReg = new RegExp(this.validatePattern);
  }

  ngAfterViewInit() {
    $(this.tagsInput.nativeElement).tagsinput({
      tagClass: () => {
        return 'label label-success';
      }
    });
    let tags = JSON.parse(JSON.stringify(this.tags || []));
    tags.forEach((item: any) => {
      $(this.tagsInput.nativeElement).tagsinput('add', item);
    });
    $(this.tagsInput.nativeElement)
      .on('beforeItemAdd', (event: any) => {
        if (this.validatePattern && !this.validateReg.test(event.item)) {
          event.cancel = true;
        }
      })
      .on('itemAdded', (event: any) => {
        this.valueChanged();
      })
      .on('itemRemoved', (event: any) => {
        this.valueChanged();
      });
  }

  ngOnDestroy() {
    $(this.tagsInput.nativeElement).tagsinput('destroy');
  }

  writeValue(value: any): void {
    this.tags = value || [];
    this.tags.forEach((item: any) => {
      $(this.tagsInput.nativeElement).tagsinput('add', item);
    });
  }

  registerOnChange(fn: (_: any) => {}): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this._onTouched = fn;
  }

  private valueChanged() {
    let items = $(this.tagsInput.nativeElement).tagsinput('items') || [];
    this.tags = items;
    this._onChange(this.tags);
  }
}
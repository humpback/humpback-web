import { Component, Input, Output, EventEmitter, ElementRef, forwardRef, ViewChild, Attribute } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

import * as ace from 'brace';
import 'brace/mode/text';
import 'brace/mode/markdown';
import 'brace/mode/json';
import 'brace/mode/xml';
import 'brace/mode/yaml';
import "brace/ext/language_tools"
import "brace/ext/searchbox"
import 'brace/theme/twilight';
import 'brace/ext/searchbox.js';

@Component({
  selector: 'nd-ace-editor',
  template: `<div #aceEditor class="nd-ace-editor"></div>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    :host .nd-ace-editor {
      width: 100%;
      height: 100%;
      min-height: 50px;
    }
  `],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AceEditorComponent),
    multi: true
  }]
})
export class AceEditorComponent implements ControlValueAccessor, Validator {

  @ViewChild('aceEditor') aceEditorElement:any;

  @Input()
  set mode(value: string) {
    if (!value) return;
    this._mode = value;
    if (this.editor) {
      this.editor.getSession().setMode(`ace/mode/${value}`);
    }
  }
  get mode(): string {
    return this._mode;
  }
  _mode: string = "text";

  @Input()
  set options(value: any) {
    if (!value) return;
    this.setEditor(value);
    this._options = value;
  }
  get options(): any {
    if (!this._options) {
      this._options = {};
    }
    return this._options;
  }
  _options: any;

  @Input()
  set readonly(value: boolean) {
    this._readonly = value;
    if (this.editor) {
      this.editor.setReadOnly(value);
    }
  }
  get readonly(): boolean {
    return this._readonly;
  }
  _readonly: boolean;

  set editorValue(value: string) {
    this._editorValue = value || "";
    this._onChange(value);
  }
  get editorValue(): string {
    return this._editorValue;
  }

  @Output()
  onLoad: EventEmitter<any> = new EventEmitter<any>();

  editor: any;
  _editorValue: string;
  _onChange = (_: any) => { };
  _onTouched = () => { };

  constructor(
    @Attribute('required') public required: boolean = false,
    @Attribute('maxlength') public maxlength: number = -1) {

  }

  ngOnInit() {
    if (!ace) {
      console.error("No ace found.");
      return;
    }
  }

  ngAfterViewInit() {
    let editorElement = this.aceEditorElement.nativeElement;
    this.editor = ace.edit(editorElement);
    this.editor.$blockScrolling = Infinity;

    this.editor.getSession().setMode(`ace/mode/${this.mode}`);
    this.editor.getSession().setValue(this.editorValue || '');
    this.editor.container.style.lineHeight = 1.5;
    this.setEditor(this.options, true);
    this.editor.setReadOnly(this._readonly);

    this.onLoad.emit(this.editor);

    this.editor.on("change", (e:any) => {
      let val = this.editor.getValue();
      this.editorValue = val;
      if (this.options.onChange && typeof this.options.onChange === "function") {
        this.options.onChange(e);
      }
    });

    if (this.options.onChange && typeof this.options.onChange === "function") {
      this.editor.on("change", this.options.onChange);
    }

    if (this.options.onLoaded && typeof this.options.onLoaded === "function") {
      this.options.onLoaded(this.editor);
    }
  }

  writeValue(value: string): void {
    this.editorValue = value || "";
    if (this.editor) {
      this.editor.getSession().setValue(this.editorValue);
    }
  }

  registerOnChange(fn: (_: any) => {}): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this._onTouched = fn;
  }

  validate(c: AbstractControl): ValidationErrors {
    let result: any = null;
    if (this.required && this.editorValue.length === 0) {
      result = { required: true };
    }
    if (this.maxlength > 0 && this.editorValue.length > this.maxlength) {
      result = { maxlength: true };
    }
    return result;
  }

  setEditor(options: any, first: boolean = false) {
    const _optionKeys: Array<string> = [
      "readonly", "theme", "fontSize", "tabSize", "enableEmmet", "enableSnippets", "showPrintMargin"
    ];
    if (!this.editor) return;
    _optionKeys.forEach((key) => {
      if (options[key] && (options[key] !== this.options[key] || first)) {
        switch (key) {
          case "readonly":
            this.editor.setReadOnly(options.readonly);
            break;
          case "theme":
            this.editor.setTheme(`ace/theme/${options.theme}`);
            break;
          case "fontSize":
            this.editor.setFontSize(options.fontSize);
            break;
          default:
            this.editor.setOption(key, options[key]);
            break;
        }
      }
    });
  }
}

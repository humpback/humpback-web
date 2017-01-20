import { Directive, Attribute, Input } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';
import { IValidationResult } from './../interfaces';

@Directive({
  selector: '[validateNotEqual][formControlName],[validateNotEqual][formControl],[validateNotEqual][ngModel],input[validateNotEqual]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: NotEqualValidator,
      multi: true
    }
  ]
})
export class NotEqualValidator implements Validator {
  @Input("validateNotEqual")
  private dynamicCompareValue: string;

  constructor( @Attribute('validateNotEqual') public validateNotEqual: string) { }

  validate(c: AbstractControl): IValidationResult {
    let v = c.value;
    let e = c.root.get(this.validateNotEqual);
    let compareValue = (e && e.value) || (this.dynamicCompareValue || '');
    if (v === compareValue) return {
      validateNotEqual: true
    }
    return null;
  }
}
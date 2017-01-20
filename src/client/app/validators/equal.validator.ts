import { Directive, Attribute, Input } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';
import { IValidationResult } from './../interfaces';

@Directive({
  selector: '[validateEqual][formControlName],[validateEqual][formControl],[validateEqual][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: EqualValidator,
      multi: true
    }
  ]
})
export class EqualValidator implements Validator {
  @Input("validateEqual")
  private dynamicCompareValue: string;

  constructor( @Attribute('validateEqual') public validateEqual: string) { }

  validate(c: AbstractControl): IValidationResult {
    let v = c.value;
    let e = c.root.get(this.validateEqual);
    let compareValue = (e && e.value) || (this.dynamicCompareValue || '');
    if (v !== compareValue) return {
      validateEqual: true
    }
    return null;
  }
}
import { Directive, Attribute } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';
import { IValidationResult } from './../interfaces';

@Directive({
  selector: '[validateIP][formControlName],[validateIP][formControl],[validateIP][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: IPValidator,
      multi: true
    }
  ]
})
export class IPValidator implements Validator {

  static IP(control: AbstractControl): IValidationResult {
    let regExp = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[[1-9][0-9]|[0-9])\.){3}((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[[1-9][0-9]|[1-9]))$/;
    if (control.value && !regExp.test(control.value)) {
      return { 'ip': true };
    }
  }

  constructor() { }

  validate(c: AbstractControl): IValidationResult {
    return IPValidator.IP(c);
  }

  registerOnValidatorChange(): void {

  }
}
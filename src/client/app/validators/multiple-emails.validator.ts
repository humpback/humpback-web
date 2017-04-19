import { Directive, Attribute, Input } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';
import { IValidationResult } from './../interfaces';

@Directive({
  selector: '[multipleEmails][formControlName],[multipleEmails][formControl],[multipleEmails][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: MultipleEmailsValidator,
      multi: true
    }
  ]
})
export class MultipleEmailsValidator implements Validator {

  private regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  constructor() { }

  validate(c: AbstractControl): IValidationResult {
    let value = c.value;
    if (value) {
      let arr = value.split(';');
      for (let email of arr) {
        if (!this.regex.test(email)) {
          return { 'multipleEmails': true };
        }
      }
    }
  }

  registerOnValidatorChange(): void {

  }
}
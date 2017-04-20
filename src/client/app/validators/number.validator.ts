import { Directive, Attribute } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS, ValidatorFn } from '@angular/forms';
import { IValidationResult } from './../interfaces';

export class NumberValidator {
  static Integer(control: AbstractControl): IValidationResult {
    if (control.value && !/^[-+]?[0-9]*$/.test(control.value)) {
      return { 'integer': true };
    }
  }

  static Range(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): IValidationResult => {
      let target = parseInt(control.value);
      if (min && target < min) {
        return { 'numberRange': true };
      }
      if (max && target > max) {
        return { 'numberRange': true };
      }
    }
  }
}

@Directive({
  selector: '[validateInteger][formControlName],[validateInteger][formControl],[validateInteger][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: IntegerValidator,
      multi: true
    }
  ]
})
export class IntegerValidator implements Validator {

  constructor() { }

  validate(c: AbstractControl): IValidationResult {
    return NumberValidator.Integer(c);
  }

  registerOnValidatorChange(): void {

  }
}

@Directive({
  selector: '[validateRange][formControlName],[validateRange][formControl],[validateRange][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: RangeValidator,
      multi: true
    }
  ]
})
export class RangeValidator implements Validator {

  constructor( @Attribute('min') public min: number, @Attribute('max') public max: number) {
  }

  validate(c: AbstractControl): IValidationResult {
    let validateFn = NumberValidator.Range(this.min, this.max);
    return validateFn(c);
  }

  registerOnValidatorChange(): void {

  }
}

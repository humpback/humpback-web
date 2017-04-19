import { IntegerValidator, RangeValidator } from './number.validator';
import { IPValidator } from './ip.validator';
import { EqualValidator } from './equal.validator';
import { NotEqualValidator } from './not-equal.validator';
import { MultipleEmailsValidator } from './multiple-emails.validator';

export {
  IntegerValidator,
  RangeValidator,
  IPValidator,
  EqualValidator,
  NotEqualValidator,
  MultipleEmailsValidator
}

let CustomValidators: Array<any> = [
  IntegerValidator,
  RangeValidator,
  IPValidator,
  EqualValidator,
  NotEqualValidator,
  MultipleEmailsValidator
]

export const CUSTOM_VALIDATORS = CustomValidators;
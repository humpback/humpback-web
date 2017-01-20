import { IntegerValidator, RangeValidator } from './number.validator';
import { IPValidator } from './ip.validator';
import { EqualValidator } from './equal.validator';
import { NotEqualValidator } from './not-equal.validator';

export * from './number.validator';
export * from './ip.validator';
export * from './equal.validator';
export * from './not-equal.validator';

let CustomValidators: Array<any> = [
  IntegerValidator,
  RangeValidator,
  IPValidator,
  EqualValidator,
  NotEqualValidator
]

export const CUSTOM_VALIDATORS = CustomValidators;
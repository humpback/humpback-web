import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isEmptyObj'
})

export class IsEmptyObjPipe implements PipeTransform {
  transform(value: any, args: any[]): any {
    if (!value) {
      return false;
    }
    return Object.keys(value).length !== 0;
  }
}
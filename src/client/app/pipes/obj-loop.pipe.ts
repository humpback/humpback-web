import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'objLoop'
})

export class ObjLoopPipe implements PipeTransform {
  transform(value: any, args: string[]): any {
    let keys: any[] = [];
    for (let key in value) {
      keys.push({ key: key, value: value[key] });
    }
    return keys;
  }
}
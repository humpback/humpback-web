import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageNameFmt'  
})

export class ImageNameFormatPipe implements PipeTransform {
  transform(value: any, args: any[]): any {
    if (!value) {
      return '';
    }
    let type = args || 'name';
    let arr = value.split(':');
    if (type === 'name') {
      return arr[0];
    } else {
      return arr[1] || "";
    }
  }
}
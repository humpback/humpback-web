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
    let slashArr = value.split('/');
    let tagSplitArr = slashArr.pop().split(':');
    if (type === 'name') {
      slashArr.push(tagSplitArr[0]);
      return slashArr.join('/');
    } else {
      return tagSplitArr[1] || "latest";
    }
  }
}

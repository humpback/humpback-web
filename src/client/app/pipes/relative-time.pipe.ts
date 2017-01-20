import { Pipe, PipeTransform } from '@angular/core';
declare var moment: any;

@Pipe({
  name: 'relativeTime'  
})

export class RelativeTimePipe implements PipeTransform {
  transform(value: number, args: any[]): any {
    if (value) {
      return moment(value).fromNow();
    }
  }
}
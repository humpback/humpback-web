import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  pure: false
})

export class FilterPipe implements PipeTransform {
  private timer: any;
  private result: any;

  transform(items: Array<any>, conditions: { [field: string]: any }): Array<any> {
    if (!items) return items;
    if (!Array.isArray(items)) return items;
    if (!conditions) return items;

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.result = items.filter(item => {
        for (let field in conditions) {
          if (!conditions[field]) {
            return true;
          }
          if (typeof item[field] === 'string') {
            return item[field].indexOf(conditions[field]) !== -1;
          }
          return (JSON.stringify(item[field]) || '').indexOf(conditions[field]) !== -1;
        }
        return true;
      });
    }, 50)
    return this.result;
  }
}
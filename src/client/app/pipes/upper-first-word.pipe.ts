import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'upperFirstWord'
})

export class UpperFirstWordPipe implements PipeTransform {
  transform(value: string): any {
    if (!value) {
      return value;
    }
    let firstWord = value.substr(0, 1);
    let leftWords = value.substring(1);
    return `${firstWord.toUpperCase()}${leftWords}`;
  }
}
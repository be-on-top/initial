import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstWord'
})
export class FirstWordPipe implements PipeTransform {
  transform(value: string): string {
    const words = value.split(' ');
    if (words.length > 1) {
      words[0] = `<span class="first-word">${words[0]}</span>`;
    }
    return words.join(' ');
  }

  
}

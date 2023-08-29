import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripHtml'
})
export class StripHtmlPipe implements PipeTransform {

  transform(value: string): string {
    const div = document.createElement('div');
    div.innerHTML = value;
    return div.textContent || div.innerText || '';
  }

}

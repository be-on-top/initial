import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateTitle'
})
export class TruncateTitlePipe implements PipeTransform {

  transform(value: string): string {
    if (!value) {
      return '';
    }
    // Split the title at the first occurrence of ' ('
    return value.split(' (')[0];
  }

}

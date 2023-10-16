import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decodeURIComponent'
})
export class DecodeURIPipe implements PipeTransform {
  transform(value: string): string {
    try {
      return decodeURIComponent(value);
    } catch (error) {
      console.error('Error decoding URI component:', error);
      return value;
    }
  }
}

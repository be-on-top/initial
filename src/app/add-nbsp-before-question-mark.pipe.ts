import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addNbspBeforeQuestionMark',
  standalone: true // <--- INDISPENSABLE ICI AUSSI
})
export class AddNbspBeforeQuestionMarkPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) {
      return value;
    }
// Remplace espace + ? par espace insécable + ?
return value.replace(/ (\?)/g, '\u00A0$1');
  }

}

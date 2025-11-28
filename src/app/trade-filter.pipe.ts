import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tradeFilter'
})
export class TradeFilterPipe implements PipeTransform {
  transform(students: any[], trade: string): any[] {
    if (!students || !trade) return [];
    return students.filter(student => student.subscriptions?.includes(trade));
  }
}

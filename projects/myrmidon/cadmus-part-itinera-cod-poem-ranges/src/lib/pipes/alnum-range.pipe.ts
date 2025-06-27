import { Pipe, PipeTransform } from '@angular/core';

import { AlnumRange } from '../services/alnum-range.service';

@Pipe({
  name: 'alnumRange',
})
export class AlnumRangePipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    const range = value as AlnumRange;
    if (!range?.a) {
      return null;
    }
    if (!range.b || range.b === range.a) {
      return range.a;
    }
    const sb: string[] = [];
    sb.push(range.a);
    sb.push('-');
    sb.push(range.b);
    return sb.join('');
  }
}

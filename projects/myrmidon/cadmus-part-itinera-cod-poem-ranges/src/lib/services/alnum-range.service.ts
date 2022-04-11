import { Injectable } from '@angular/core';
import { Alnum } from './alnum';

/**
 * A range of alphanumerics.
 */
export interface AlnumRange {
  a: string;
  b?: string;
}

export const ALNUM_RANGE_PATTERN = '([^-\\s,]+)(?:-([^-\\s,]+))?';

@Injectable({
  providedIn: 'root',
})
export class AlnumRangeService {
  public static readonly rangeRegExp = new RegExp(ALNUM_RANGE_PATTERN);
  private static readonly _rangesRegExp = new RegExp(ALNUM_RANGE_PATTERN, 'g');

  private getRangeFromMatch(match: RegExpExecArray): AlnumRange | null {
    return match
      ? {
          a: match[1],
          b: match[2] ? match[2] : match[1],
        }
      : null;
  }

  /**
   * Parse the specified text representing a range.
   * @param text The text.
   * @returns Range or null.
   */
  public parseRange(text: string | undefined | null): AlnumRange | null {
    if (!text) {
      return null;
    }
    const m = AlnumRangeService.rangeRegExp.exec(text);
    return m ? this.getRangeFromMatch(m) : null;
  }

  /**
   * Parse the specified text representing a list of ranges.
   * @param text The text.
   * @returns Array of ranges.
   */
  public parseRanges(text: string | undefined | null): AlnumRange[] {
    if (!text) {
      return [];
    }
    const ranges: AlnumRange[] = [];
    let m: RegExpExecArray | null;
    while ((m = AlnumRangeService._rangesRegExp.exec(text))) {
      ranges.push(this.getRangeFromMatch(m)!);
    }
    return ranges;
  }

  /**
   * Convert the specified range to a string.
   * @param range The range or null.
   * @returns The string.
   */
  public rangeToString(range: AlnumRange | undefined | null): string {
    if (!range?.a) {
      return '';
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

  /**
   * Convert an array of ranges into a parsable string.
   * @param ranges The ranges.
   * @returns The string.
   */
  public rangesToString(ranges: AlnumRange[] | undefined | null): string {
    if (!ranges?.length) {
      return '';
    }
    const sb: string[] = [];

    for (const range of ranges) {
      sb.push(this.rangeToString(range));
    }

    return sb.join(' ');
  }

  /**
   * Expand ranges.
   * @param ranges The ranges.
   * @returns A list of strings, each representing an entry
   * in the received ranges.
   */
  public expandRanges(ranges: AlnumRange[]): string[] {
    const expanded: string[] = [];

    for (const r of ranges) {
      if (r.b && r.b !== r.a) {
        const first = Alnum.parse(r.a);
        const last = Alnum.parse(r.b);
        if (!first || !last) {
          continue;
        }

        // a range cannot include an A part;
        // in this case, expand as two different single ranges
        if (first.a || last.a) {
          expanded.push(first.toString());
          expanded.push(last.toString());
        } else {
          for (let n = first.n; n <= last.n; n++) {
            expanded.push(n.toString());
          }
        }
      } else {
        expanded.push(r.a);
      }
    }

    return expanded;
  }

  public alnumToRanges(a: Alnum[]): AlnumRange[] {
    const ranges: AlnumRange[] = [];
    let i = 0;
    while (i < a.length - 1) {
      // just copy if has alpha
      if (a[i].a) {
        ranges.push({
          a: Alnum.toString(a[i++]),
        });
        continue;
      }
      // try building a range
      let j = i + 1;
      while (j < a.length && !a[j].a && a[j].n - 1 === a[j - 1].n) {
        j++;
      }
      if (j - i > 1) {
        ranges.push({
          a: Alnum.toString(a[i]),
          b: Alnum.toString(a[j - 1]),
        });
        i = j;
        continue;
      } else {
        ranges.push({
          a: Alnum.toString(a[i++]),
        });
      }
    }
    if (i < a.length) {
      ranges.push({ a: Alnum.toString(a[i]) });
    }
    return ranges;
  }

  public intersectRanges(a: AlnumRange[], b: AlnumRange[]): AlnumRange[] {
    const expA: string[] = this.expandRanges(a);
    const expB: string[] = this.expandRanges(b);
    const common = expA.filter((x) => expB.includes(x));
    const ab: Alnum[] = common.map((s) => Alnum.parse(s)!);
    return this.alnumToRanges(ab);
  }
}

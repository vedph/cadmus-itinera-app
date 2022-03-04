import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { CodPoemLayout } from '../cod-poem-ranges-part';

import { Alnum } from './alnum';
import { AlnumRange, AlnumRangeService } from './alnum-range.service';

/**
 * A poem layout row.
 */
export interface PoemLayoutRow {
  nr: Alnum;
  layout?: string;
  checked?: boolean;
}

/**
 * A table of poem layout rows.
 */
export class PoemLayoutTable {
  private readonly _alnumService: AlnumRangeService;

  private _rows$: BehaviorSubject<PoemLayoutRow[]>;

  public get rows$(): Observable<PoemLayoutRow[]> {
    return this._rows$.asObservable();
  }

  constructor() {
    this._alnumService = new AlnumRangeService();
    this._rows$ = new BehaviorSubject<PoemLayoutRow[]>([]);
  }

  /**
   * Get the current rows in a newly created array.
   *
   * @returns The rows.
   */
  public getRows(): PoemLayoutRow[] {
    return [...this._rows$.value];
  }

  /**
   * Sets the rows defined by expanding the specified ranges.
   *
   * @param ranges The ranges.
   */
  public setRows(ranges: AlnumRange[]): void {
    const rows: PoemLayoutRow[] = [];
    this._alnumService.expandRanges(ranges).forEach((s) => {
      const an = Alnum.parse(s);
      if (an) {
        rows.push({
          nr: an,
        });
      }
    });
    this._rows$.next(rows);
  }

  /**
   * Set the layout of the row at the specified index in this table.
   * @param index The row index.
   * @param layout The layout to set.
   */
  public setLayout(index: number, layout: string | null | undefined): void {
    const rows = [...this._rows$.value];
    rows[index].layout = layout ? layout : undefined;
    this._rows$.next(rows);
  }

  /**
   * Sets the specified layouts on the table's rows.
   *
   * @param layouts The layouts to set.
   */
  public setLayouts(layouts: CodPoemLayout[]): void {
    const rows = [...this._rows$.value];
    layouts.forEach((l) => {
      this._alnumService.expandRanges([l.range]).forEach((s) => {
        const an = Alnum.parse(s);
        if (an) {
          const row = rows.find((r) => r.nr.n === an.n && r.nr.a == an.a);
          if (row) {
            row.layout = l.layout;
          }
        }
      });
    });
    this._rows$.next(rows);
  }

  /**
   * Check or uncheck all the rows at once.
   *
   * @param on True to check, false or undefined to uncheck.
   */
  public toggleAllCheck(on: boolean | undefined): void {
    const rows = [...this._rows$.value];
    for (let i = 0; i < rows.length; i++) {
      rows[i].checked = on ? true : undefined;
    }
    this._rows$.next(rows);
  }

  private getCheckBounds(rows: PoemLayoutRow[]): number[] {
    let a = 0;
    while (a < rows.length && !rows[a].checked) {
      a++;
    }
    if (a === rows.length) {
      return [];
    }
    let b = a + 1;
    while (b < rows.length && rows[b].checked) {
      b++;
    }
    return b === a + 1 ? [a] : [a, b - 1];
  }

  /**
   * Check the row at the specified index. This has different effects according
   * to the check state: when 2 or more rows are checked, they get all unchecked
   * and then the row at the specified index is checked; when a single row is
   * checked, all the rows comprised between the new one and the existing one
   * are checked; if none is checked, the new one is checked.
   *
   * @param index The index of the row to check.
   */
  public setCheck(index: number): void {
    const rows = [...this._rows$.value];
    const ab = this.getCheckBounds(rows);

    switch (ab.length) {
      // many checked rows: uncheck all and set A
      case 2:
        for (let i = ab[0]; i <= ab[1]; i++) {
          rows[i].checked = undefined;
        }
        rows[index].checked = true;
        break;
      case 1:
        // single checked row: check rows between
        if (index <= ab[0]) {
          for (let i = index; i <= ab[0]; i++) {
            rows[i].checked = true;
          }
        } else {
          for (let i = ab[0]; i <= index; i++) {
            rows[i].checked = true;
          }
        }
        break;
      default:
        // no checked row: set A
        rows[index].checked = true;
        break;
    }

    this._rows$.next(rows);
  }

  /**
   * Set the layout for all the checked rows, if any.
   * @param layout The layout to set.
   */
  public setCheckedLayout(layout: string | null | undefined): void {
    const rows = [...this._rows$.value];
    const ab = this.getCheckBounds(rows);
    if (!ab.length) {
      return;
    }
    for (let i = ab[0]; i <= ab[1]; i++) {
      rows[i].layout = layout ? layout : undefined;
    }
    this._rows$.next(rows);
  }
}

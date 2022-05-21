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
  note?: string;
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
   * Get the index of the specified row.
   *
   * @param row The row to find the index of.
   * @returns The index or -1.
   */
  public getRowIndex(row: PoemLayoutRow): number {
    return this._rows$.value.findIndex((r) => r.nr.compare(row.nr) === 0);
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
   * Set the row at the specified index.
   *
   * @param index The index.
   * @param row The row.
   */
  public setRow(index: number, row: PoemLayoutRow): void {
    const rows = [...this._rows$.value];
    rows[index] = row;
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
   * Set the note of the row at the specified index in this table.
   * @param index The row index.
   * @param note The note to set.
   */
  public setNote(index: number, note: string | null | undefined): void {
    const rows = [...this._rows$.value];
    rows[index].note = note ? note : undefined;
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

  private getSelectionRange(rows: PoemLayoutRow[], target: number): number[] {
    // find the nearest checked to the right
    let i = target + 1;
    while (i < rows.length && !rows[i].checked) {
      i++;
    }
    if (i < rows.length) {
      return [target, i];
    }

    // if not found, found the nearest checked to the left
    i = target - 1;
    while (i > -1 && !rows[i].checked) {
      i--;
    }
    if (i > -1) {
      return [i, target];
    }

    // nothing checked
    return [target, target];
  }

  /**
   * Check the row at the specified index.
   * With mode=single, the target row is toggled; if this results in being
   * checked, all the other are unchecked.
   * With mode=range, if nothing is selected it's equivalent to single;
   * else, an added selection will extend from the previously selected
   * row to the newly selected row.
   * With mode=add, the target row is toggled, while preserving the rest
   * of the selection.
   *
   * @param index The index of the row to check.
   */
  public setChecked(index: number, mode: CodPoemLayoutCheckMode): void {
    const rows = [...this._rows$.value];

    switch (mode) {
      case CodPoemLayoutCheckMode.Range:
        // range: check range
        const ab = this.getSelectionRange(rows, index);
        for (let i = ab[0]; i <= ab[1]; i++) {
          rows[i].checked = true;
        }
        break;
      case CodPoemLayoutCheckMode.Add:
        // add: toggle
        rows[index].checked = rows[index].checked ? undefined : true;
        break;
      default:
        // single: if checked, uncheck it
        if (rows[index].checked) {
          rows[index].checked = undefined;
        } else {
          // if not checked, check it unchecking all the others
          for (let i = 0; i < rows.length; i++) {
            rows[i].checked = undefined;
          }
          rows[index].checked = true;
        }
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
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].checked) {
        rows[i].layout = layout ? layout : undefined;
      }
    }
    this._rows$.next(rows);
  }

  /**
   * Get the currently defined layouts in the table.
   * @returns Array of layouts.
   */
  public getLayouts(): CodPoemLayout[] {
    const rows = this._rows$.value;
    const layouts: CodPoemLayout[] = [];
    let i = 0;
    while (i < rows.length) {
      if (rows[i].layout) {
        let start = i++;
        // rows are expanded here, so we can assume that
        // all the consecutive rows with the same layout
        // and without any alpha (which breaks sequences)
        // belongs to the same range
        while (
          i < rows.length &&
          rows[i].layout === rows[start].layout &&
          !rows[i].nr.a
        ) {
          i++;
        }
        layouts.push({
          range: {
            a: Alnum.toString(rows[start].nr),
            b: start + 1 === i ? undefined : Alnum.toString(rows[i - 1].nr),
          },
          layout: rows[start].layout!,
          note: rows[start].note,
        });
      } else {
        i++;
      }
    }
    return layouts;
  }
}

export enum CodPoemLayoutCheckMode {
  Single,
  Range,
  Add
}

import { Alnum } from './alnum';
import { AlnumRangeService } from './alnum-range.service';
import { CodPoemLayoutCheckMode, PoemLayoutTable } from './poem-layout-table';

describe('PoemLayoutTable', () => {
  it('setRows should set rows (no expand)', () => {
    const table = new PoemLayoutTable();
    table.setRows([
      {
        a: '1',
      },
      {
        a: '2',
      },
    ]);
    const rows = table.getRows();
    expect(rows.length).toBe(2);

    let row = rows[0];
    expect(row.nr.n).toBe(1);
    expect(row.nr.a).toBeFalsy();
    row = rows[1];
    expect(row.nr.n).toBe(2);
    expect(row.nr.a).toBeFalsy();
  });

  it('setRows should set rows (expand)', () => {
    const table = new PoemLayoutTable();
    table.setRows([
      {
        a: '1',
        b: '3',
      },
      {
        a: '3b',
      },
      {
        a: '4',
      },
    ]);
    const rows = table.getRows();
    expect(rows.length).toBe(5);

    let row = rows[0];
    expect(row.nr.n).toBe(1);
    expect(row.nr.a).toBeFalsy();
    row = rows[1];
    expect(row.nr.n).toBe(2);
    expect(row.nr.a).toBeFalsy();
    row = rows[2];
    expect(row.nr.n).toBe(3);
    expect(row.nr.a).toBeFalsy();
    row = rows[3];
    expect(row.nr.n).toBe(3);
    expect(row.nr.a).toBe('b');
    row = rows[4];
    expect(row.nr.n).toBe(4);
    expect(row.nr.a).toBeFalsy();
  });

  it('toggleAllCheck(true) should check all rows', () => {
    const table = new PoemLayoutTable();
    table.setRows([
      {
        a: '1',
        b: '3',
      },
    ]);
    table.toggleAllCheck(true);

    const rows = table.getRows();
    expect(rows.length).toBe(3);
    for (let i = 0; i < rows.length; i++) {
      expect(rows[i].checked).toBe(true);
    }
  });

  it('toggleAllCheck(false) should uncheck all rows', () => {
    const table = new PoemLayoutTable();
    table.setRows([
      {
        a: '1',
        b: '3',
      },
    ]);
    table.toggleAllCheck(true);
    table.toggleAllCheck(false);

    const rows = table.getRows();
    expect(rows.length).toBe(3);
    for (let i = 0; i < rows.length; i++) {
      expect(rows[i].checked).toBeUndefined();
    }
  });

  it('setCheck(single) with no check should check one', () => {
    const table = new PoemLayoutTable();
    table.setRows([
      {
        a: '1',
        b: '3',
      },
    ]);
    table.setChecked(1, CodPoemLayoutCheckMode.Single);

    const rows = table.getRows();
    expect(rows.length).toBe(3);
    expect(rows[0].checked).toBeUndefined();
    expect(rows[1].checked).toBe(true);
    expect(rows[2].checked).toBeUndefined();
  });

  it('setCheck(single) with other checks should clear except target', () => {
    const table = new PoemLayoutTable();
    table.setRows([
      {
        a: '1',
        b: '3',
      },
    ]);
    table.setChecked(0, CodPoemLayoutCheckMode.Single);
    table.setChecked(1, CodPoemLayoutCheckMode.Single)

    const rows = table.getRows();
    expect(rows.length).toBe(3);
    expect(rows[0].checked).toBeUndefined();
    expect(rows[1].checked).toBe(true);
    expect(rows[2].checked).toBeUndefined();
  });

  it('setCheck(add) with no check should check one', () => {
    const table = new PoemLayoutTable();
    table.setRows([
      {
        a: '1',
        b: '3',
      },
    ]);
    table.setChecked(1, CodPoemLayoutCheckMode.Add);

    const rows = table.getRows();
    expect(rows.length).toBe(3);
    expect(rows[0].checked).toBeUndefined();
    expect(rows[1].checked).toBe(true);
    expect(rows[2].checked).toBeUndefined();
  });

  it('setCheck(add) with existing check should check both', () => {
    const table = new PoemLayoutTable();
    table.setRows([
      {
        a: '1',
        b: '3',
      },
    ]);
    table.setChecked(1, CodPoemLayoutCheckMode.Single);
    table.setChecked(2, CodPoemLayoutCheckMode.Add);

    const rows = table.getRows();
    expect(rows.length).toBe(3);
    expect(rows[0].checked).toBeUndefined();
    expect(rows[1].checked).toBe(true);
    expect(rows[2].checked).toBe(true);
  });

  it('setCheck(range) with no check should check one', () => {
    const table = new PoemLayoutTable();
    table.setRows([
      {
        a: '1',
        b: '3',
      },
    ]);
    table.setChecked(1, CodPoemLayoutCheckMode.Range);

    const rows = table.getRows();
    expect(rows.length).toBe(3);
    expect(rows[0].checked).toBeUndefined();
    expect(rows[1].checked).toBe(true);
    expect(rows[2].checked).toBeUndefined();
  });

  it('setCheck(range) with existing checks should check range', () => {
    const table = new PoemLayoutTable();
    table.setRows([
      {
        a: '1',
        b: '5',
      },
    ]);
    table.setChecked(0, CodPoemLayoutCheckMode.Add);
    table.setChecked(4, CodPoemLayoutCheckMode.Add);
    table.setChecked(2, CodPoemLayoutCheckMode.Range);

    const rows = table.getRows();
    expect(rows.length).toBe(5);
    expect(rows[0].checked).toBe(true);
    expect(rows[1].checked).toBeUndefined();
    expect(rows[2].checked).toBe(true);
    expect(rows[3].checked).toBe(true);
    expect(rows[4].checked).toBe(true);
  });

  it('setCheckedLayout should set checked rows layout', () => {
    const table = new PoemLayoutTable();
    table.setRows([
      {
        a: '1',
        b: '3',
      },
    ]);
    table.setChecked(1, CodPoemLayoutCheckMode.Add);
    table.setChecked(2, CodPoemLayoutCheckMode.Add);
    table.setCheckedLayout('x');

    const rows = table.getRows();
    expect(rows.length).toBe(3);
    expect(rows[0].layout).toBeUndefined();
    expect(rows[1].layout).toBe('x');
    expect(rows[2].layout).toBe('x');
  });

  it('setLayouts should set rows layout', () => {
    const table = new PoemLayoutTable();
    table.setRows([
      {
        a: '1',
        b: '5',
      },
    ]);
    table.setLayouts([
      {
        range: { a: '1' },
        layout: 'x',
      },
      {
        range: { a: '4', b: '5' },
        layout: 'y',
      },
    ]);

    const rows = table.getRows();
    expect(rows.length).toBe(5);
    expect(rows[0].layout).toBe('x');
    expect(rows[1].layout).toBeUndefined();
    expect(rows[2].layout).toBeUndefined();
    expect(rows[3].layout).toBe('y');
    expect(rows[4].layout).toBe('y');
  });

  function createTable(ranges: string): PoemLayoutTable {
    const table = new PoemLayoutTable();
    table.setRows(new AlnumRangeService().parseRanges(ranges));
    return table;
  }

  const numbers = (table: PoemLayoutTable) =>
    table.getRows().map((r) => Alnum.toString(r.nr));
  const checked = (table: PoemLayoutTable) =>
    table.getRows().map((r) => !!r.checked);

  it('should start empty', () => {
    const table = new PoemLayoutTable();
    expect(table.getRows()).toEqual([]);
    expect(table.getLayouts()).toEqual([]);
  });

  it('rows$ should emit the rows whenever they change', () => {
    const table = new PoemLayoutTable();
    const emitted: number[] = [];
    const sub = table.rows$.subscribe((rows) => emitted.push(rows.length));

    table.setRows([{ a: '1', b: '3' }]);
    table.setRows([]);
    sub.unsubscribe();

    expect(emitted).toEqual([0, 3, 0]);
  });

  it('setRows should keep the boundaries of a suffixed range', () => {
    const table = createTable('1-2 3a-5');
    expect(numbers(table)).toEqual(['1', '2', '3a', '5']);
  });

  it('setRows should skip unparsable ranges', () => {
    const table = createTable('1 alpha 2');
    expect(numbers(table)).toEqual(['1', '2']);
  });

  it('getRows should return a new array', () => {
    const table = createTable('1-2');
    expect(table.getRows()).not.toBe(table.getRows());
    expect(table.getRows()).toEqual(table.getRows());
  });

  it('getRowIndex should find a row by its number', () => {
    const table = createTable('1-2 3a 4');
    expect(table.getRowIndex({ nr: new Alnum(1) })).toBe(0);
    expect(table.getRowIndex({ nr: new Alnum(3, 'a') })).toBe(2);
    expect(table.getRowIndex({ nr: new Alnum(4) })).toBe(3);
  });

  it('getRowIndex should return -1 for a missing row', () => {
    const table = createTable('1-2 3a 4');
    expect(table.getRowIndex({ nr: new Alnum(3) })).toBe(-1);
    expect(table.getRowIndex({ nr: new Alnum(9) })).toBe(-1);
  });

  it('setRow should replace the row at index', () => {
    const table = createTable('1-3');
    table.setRow(1, { nr: new Alnum(2), layout: 'x', note: 'n' });

    const rows = table.getRows();
    expect(rows).toHaveLength(3);
    expect(rows[1]).toEqual({ nr: new Alnum(2), layout: 'x', note: 'n' });
    expect(rows[0].layout).toBeUndefined();
  });

  it('setLayout should set or clear the layout at index', () => {
    const table = createTable('1-3');
    table.setLayout(1, 'x');
    expect(table.getRows().map((r) => r.layout)).toEqual([
      undefined,
      'x',
      undefined,
    ]);

    table.setLayout(1, null);
    expect(table.getRows()[1].layout).toBeUndefined();
  });

  it('setNote should set or clear the note at index', () => {
    const table = createTable('1-3');
    table.setNote(2, 'a note');
    expect(table.getRows().map((r) => r.note)).toEqual([
      undefined,
      undefined,
      'a note',
    ]);

    table.setNote(2, undefined);
    expect(table.getRows()[2].note).toBeUndefined();
  });

  it('setLayouts should set layout and note on suffixed rows too', () => {
    const table = createTable('1 2a 3');
    table.setLayouts([{ range: { a: '2a' }, layout: 'x', note: 'n' }]);

    const rows = table.getRows();
    expect(rows[0].layout).toBeUndefined();
    expect(rows[1].layout).toBe('x');
    expect(rows[1].note).toBe('n');
    expect(rows[2].layout).toBeUndefined();
  });

  it('setLayouts should ignore layouts for missing rows', () => {
    const table = createTable('1-2');
    table.setLayouts([
      { range: { a: '5', b: '6' }, layout: 'x' },
      { range: { a: 'alpha' }, layout: 'y' },
    ]);
    expect(table.getRows().every((r) => !r.layout)).toBe(true);
  });

  it('setCheck(single) on a checked row should uncheck it only', () => {
    const table = createTable('1-3');
    table.toggleAllCheck(true);
    table.setChecked(1, CodPoemLayoutCheckMode.Single);
    expect(checked(table)).toEqual([true, false, true]);
  });

  it('setCheck(add) on a checked row should uncheck it only', () => {
    const table = createTable('1-3');
    table.toggleAllCheck(true);
    table.setChecked(1, CodPoemLayoutCheckMode.Add);
    expect(checked(table)).toEqual([true, false, true]);
  });

  it('setCheck(range) should extend to the nearest checked row on the right', () => {
    const table = createTable('1-5');
    table.setChecked(3, CodPoemLayoutCheckMode.Single);
    table.setChecked(1, CodPoemLayoutCheckMode.Range);
    expect(checked(table)).toEqual([false, true, true, true, false]);
  });

  it('setCheck(range) should extend to the nearest checked row on the left', () => {
    const table = createTable('1-5');
    table.setChecked(0, CodPoemLayoutCheckMode.Single);
    table.setChecked(2, CodPoemLayoutCheckMode.Range);
    expect(checked(table)).toEqual([true, true, true, false, false]);
  });

  it('setCheckedGroup should check the rows with the specified numbers', () => {
    const table = createTable('1-3 4a');
    table.setCheckedGroup([new Alnum(2), new Alnum(4, 'a'), new Alnum(9)]);
    expect(checked(table)).toEqual([false, true, false, true]);
  });

  it('setCheckedGroup should uncheck the rows with the specified numbers', () => {
    const table = createTable('1-3');
    table.toggleAllCheck(true);
    table.setCheckedGroup([new Alnum(1), new Alnum(3)], false);
    expect(checked(table)).toEqual([false, true, false]);
  });

  it('setCheckedLayout should clear the layout of checked rows', () => {
    const table = createTable('1-3');
    table.setLayouts([{ range: { a: '1', b: '3' }, layout: 'x' }]);
    table.setChecked(1, CodPoemLayoutCheckMode.Single);
    table.setCheckedLayout(null);
    expect(table.getRows().map((r) => r.layout)).toEqual(['x', undefined, 'x']);
  });

  it('getLayouts should collapse consecutive rows with the same layout', () => {
    const table = createTable('1-6');
    table.setLayouts([
      { range: { a: '1', b: '3' }, layout: 'x' },
      { range: { a: '5', b: '6' }, layout: 'y' },
    ]);

    expect(table.getLayouts()).toEqual([
      { range: { a: '1', b: '3' }, layout: 'x', note: undefined },
      { range: { a: '5', b: '6' }, layout: 'y', note: undefined },
    ]);
  });

  it('getLayouts should not collapse rows with different layouts', () => {
    const table = createTable('1-3');
    table.setLayout(0, 'x');
    table.setLayout(1, 'y');
    table.setLayout(2, 'x');

    expect(
      table.getLayouts().map((l) => [l.range.a, l.range.b, l.layout]),
    ).toEqual([
      ['1', undefined, 'x'],
      ['2', undefined, 'y'],
      ['3', undefined, 'x'],
    ]);
  });

  it('getLayouts should not collapse rows with different notes', () => {
    const table = createTable('1-3');
    table.setLayouts([{ range: { a: '1', b: '3' }, layout: 'x' }]);
    table.setNote(1, 'n');

    expect(table.getLayouts()).toEqual([
      { range: { a: '1', b: undefined }, layout: 'x', note: undefined },
      { range: { a: '2', b: undefined }, layout: 'x', note: 'n' },
      { range: { a: '3', b: undefined }, layout: 'x', note: undefined },
    ]);
  });

  it('getLayouts should not collapse non consecutive or suffixed rows', () => {
    const table = createTable('1 2 2a 3 5');
    table.toggleAllCheck(true);
    table.setCheckedLayout('x');

    expect(table.getLayouts().map((l) => [l.range.a, l.range.b])).toEqual([
      ['1', '2'],
      ['2a', undefined],
      ['3', undefined],
      ['5', undefined],
    ]);
  });

  it('getLayouts should round-trip with setLayouts', () => {
    const layouts = [
      { range: { a: '1', b: '2' }, layout: 'x', note: 'n' },
      { range: { a: '4', b: undefined }, layout: 'y', note: undefined },
    ];
    const table = createTable('1-5');
    table.setLayouts(layouts);
    expect(table.getLayouts()).toEqual(layouts);
  });
});

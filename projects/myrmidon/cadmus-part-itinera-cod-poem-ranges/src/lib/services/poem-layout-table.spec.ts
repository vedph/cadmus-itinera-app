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
      expect(rows[i].checked).toBeTrue();
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
    expect(rows[1].checked).toBeTrue();
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
    expect(rows[1].checked).toBeTrue();
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
    expect(rows[1].checked).toBeTrue();
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
    expect(rows[1].checked).toBeTrue();
    expect(rows[2].checked).toBeTrue();
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
    expect(rows[1].checked).toBeTrue();
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
    expect(rows[0].checked).toBeTrue();
    expect(rows[1].checked).toBeUndefined();
    expect(rows[2].checked).toBeTrue();
    expect(rows[3].checked).toBeTrue();
    expect(rows[4].checked).toBeTrue();
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
});

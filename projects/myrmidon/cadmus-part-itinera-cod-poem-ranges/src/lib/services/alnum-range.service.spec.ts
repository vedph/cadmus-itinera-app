import { TestBed } from '@angular/core/testing';
import { Alnum } from './alnum';

import { AlnumRangeService } from './alnum-range.service';

describe('AlnumRangeService', () => {
  let service: AlnumRangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlnumRangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('parseRange(null) rets null', () => {
    expect(service.parseRange(null)).toBeNull();
  });

  it('parseRange("") rets null', () => {
    expect(service.parseRange('')).toBeNull();
  });

  it('parseRange("1") rets ab=1', () => {
    const range = service.parseRange('1');
    expect(range!.a).toBe('1');
    expect(range!.b).toBe('1');
  });

  it('parseRange("1-3") rets a=1 b=3', () => {
    const range = service.parseRange('1-3');
    expect(range!.a).toBe('1');
    expect(range!.b).toBe('3');
  });

  it('parseRange("1a") rets ab=1a', () => {
    const range = service.parseRange('1a');
    expect(range!.a).toBe('1a');
    expect(range!.b).toBe('1a');
  });

  it('parseRange("alpha") rets ab=alpha', () => {
    const range = service.parseRange('alpha');
    expect(range!.a).toBe('alpha');
    expect(range!.b).toBe('alpha');
  });

  it('parseRanges("1 2-5 7-8 10")', () => {
    const ranges = service.parseRanges('1 2-5 7-8 10');
    expect(ranges.length).toBe(4);

    expect(ranges[0].a).toBe('1');
    expect(ranges[0].b).toBe('1');

    expect(ranges[1].a).toBe('2');
    expect(ranges[1].b).toBe('5');

    expect(ranges[2].a).toBe('7');
    expect(ranges[2].b).toBe('8');

    expect(ranges[3].a).toBe('10');
    expect(ranges[3].b).toBe('10');
  });

  it('parseRanges("1 2-5 7-8 9a")', () => {
    const ranges = service.parseRanges('1 2-5 7-8 9a');
    expect(ranges.length).toBe(4);

    expect(ranges[0].a).toBe('1');
    expect(ranges[0].b).toBe('1');

    expect(ranges[1].a).toBe('2');
    expect(ranges[1].b).toBe('5');

    expect(ranges[2].a).toBe('7');
    expect(ranges[2].b).toBe('8');

    expect(ranges[3].a).toBe('9a');
    expect(ranges[3].b).toBe('9a');
  });

  it('expandRanges(1 2-5 8a) is 1 2 3 4 5 8a', () => {
    const ranges = service.parseRanges('1 2-5 8a');
    const expanded = service.expandRanges(ranges);
    expect(expanded.length).toBe(6);
    expect(expanded[0]).toBe('1');
    expect(expanded[1]).toBe('2');
    expect(expanded[2]).toBe('3');
    expect(expanded[3]).toBe('4');
    expect(expanded[4]).toBe('5');
    expect(expanded[5]).toBe('8a');
  });

  it('parseRanges("1 2-5 alpha 7-8 9a")', () => {
    const ranges = service.parseRanges('1 2-5 alpha 7-8 9a');
    expect(ranges.length).toBe(5);

    expect(ranges[0].a).toBe('1');
    expect(ranges[0].b).toBe('1');

    expect(ranges[1].a).toBe('2');
    expect(ranges[1].b).toBe('5');

    expect(ranges[2].a).toBe('alpha');
    expect(ranges[2].b).toBe('alpha');

    expect(ranges[3].a).toBe('7');
    expect(ranges[3].b).toBe('8');

    expect(ranges[4].a).toBe('9a');
    expect(ranges[4].b).toBe('9a');
  });

  it('alnumToRanges 1 2 3 4a 5 6 8 to 1-3 4a 5-6 8', () => {
    const a: Alnum[] = [
      Alnum.parse('1')!,
      Alnum.parse('2')!,
      Alnum.parse('3')!,
      Alnum.parse('4a')!,
      Alnum.parse('5')!,
      Alnum.parse('6')!,
      Alnum.parse('8')!,
    ];
    const ranges = service.alnumToRanges(a);
    expect(ranges.length).toBe(4);
    // 1-3
    expect(ranges[0].a).toBe('1');
    expect(ranges[0].b).toBe('3');
    // 4a
    expect(ranges[1].a).toBe('4a');
    expect(ranges[1].b).toBeFalsy();
    // 5-6
    expect(ranges[2].a).toBe('5');
    expect(ranges[2].b).toBe('6');
    // 8
    expect(ranges[3].a).toBe('8');
    expect(ranges[3].b).toBeFalsy();
  });

  it('intersectRanges 1-3 4a 4b 5-6 with 3 4b 5-8 = 3 4b 5-6', () => {
    const a = service.parseRanges('1-3 4a 4b 5-6');
    const b = service.parseRanges('3 4b 5-8');
    const i = service.intersectRanges(a, b);
    expect(service.rangesToString(i)).toBe('3 4b 5-6');
  });

  it('parseRange picks the first range only', () => {
    expect(service.parseRange('1-3 5')).toEqual({ a: '1', b: '3' });
  });

  it('parseRange is repeatable', () => {
    // a stateful (global) regular expression would alternate results
    expect(service.parseRange('1-3')).toEqual({ a: '1', b: '3' });
    expect(service.parseRange('1-3')).toEqual({ a: '1', b: '3' });
  });

  it('parseRanges(null) and parseRanges("") ret empty', () => {
    expect(service.parseRanges(null)).toEqual([]);
    expect(service.parseRanges(undefined)).toEqual([]);
    expect(service.parseRanges('')).toEqual([]);
  });

  it('parseRanges accepts commas as separators', () => {
    expect(service.parseRanges('1, 2-5,7')).toEqual([
      { a: '1', b: '1' },
      { a: '2', b: '5' },
      { a: '7', b: '7' },
    ]);
  });

  it('parseRanges is repeatable', () => {
    expect(service.parseRanges('1 2-5')).toHaveLength(2);
    expect(service.parseRanges('1 2-5')).toHaveLength(2);
  });

  it('rangeToString of nothing is empty', () => {
    expect(service.rangeToString(null)).toBe('');
    expect(service.rangeToString(undefined)).toBe('');
    expect(service.rangeToString({ a: '' })).toBe('');
  });

  it('rangeToString of a single value is the value', () => {
    expect(service.rangeToString({ a: '3' })).toBe('3');
    expect(service.rangeToString({ a: '3', b: '3' })).toBe('3');
  });

  it('rangeToString of a range is a-b', () => {
    expect(service.rangeToString({ a: '3', b: '7' })).toBe('3-7');
  });

  it('rangesToString of nothing is empty', () => {
    expect(service.rangesToString(null)).toBe('');
    expect(service.rangesToString(undefined)).toBe('');
    expect(service.rangesToString([])).toBe('');
  });

  it('rangesToString round-trips with parseRanges', () => {
    const text = '1 2-5 7-8 9a';
    expect(service.rangesToString(service.parseRanges(text))).toBe(text);
  });

  it('expandRanges of nothing is empty', () => {
    expect(service.expandRanges([])).toEqual([]);
  });

  it('expandRanges of a range without b is its a', () => {
    expect(service.expandRanges([{ a: '4' }])).toEqual(['4']);
  });

  it('expandRanges of a range with suffixes is its boundaries', () => {
    // a range cannot be enumerated when its boundaries have a suffix
    expect(service.expandRanges([{ a: '1a', b: '3' }])).toEqual(['1a', '3']);
    expect(service.expandRanges([{ a: '1', b: '3b' }])).toEqual(['1', '3b']);
  });

  it('expandRanges skips a range with unparsable boundaries', () => {
    expect(
      service.expandRanges([
        { a: 'alpha', b: 'beta' },
        { a: '1', b: '2' },
      ]),
    ).toEqual(['1', '2']);
  });

  it('expandRanges of a descending range is empty', () => {
    expect(service.expandRanges([{ a: '5', b: '3' }])).toEqual([]);
  });

  it('alnumToRanges of nothing is empty', () => {
    expect(service.alnumToRanges([])).toEqual([]);
  });

  it('alnumToRanges of a single number is that number', () => {
    expect(service.alnumToRanges([new Alnum(3)])).toEqual([{ a: '3' }]);
  });

  it('alnumToRanges does not join non consecutive numbers', () => {
    expect(
      service.alnumToRanges([new Alnum(1), new Alnum(3), new Alnum(5)]),
    ).toEqual([{ a: '1' }, { a: '3' }, { a: '5' }]);
  });

  it('alnumToRanges ends a range at the last number', () => {
    expect(
      service.alnumToRanges([new Alnum(1), new Alnum(2), new Alnum(3)]),
    ).toEqual([{ a: '1', b: '3' }]);
  });

  it('alnumToRanges keeps a trailing suffixed number apart', () => {
    expect(
      service.alnumToRanges([new Alnum(1), new Alnum(2), new Alnum(3, 'a')]),
    ).toEqual([{ a: '1', b: '2' }, { a: '3a' }]);
  });

  it('intersectRanges of disjoint ranges is empty', () => {
    expect(
      service.intersectRanges(
        service.parseRanges('1-3'),
        service.parseRanges('4-6'),
      ),
    ).toEqual([]);
  });

  it('intersectRanges with nothing is empty', () => {
    expect(service.intersectRanges(service.parseRanges('1-3'), [])).toEqual(
      [],
    );
  });
});

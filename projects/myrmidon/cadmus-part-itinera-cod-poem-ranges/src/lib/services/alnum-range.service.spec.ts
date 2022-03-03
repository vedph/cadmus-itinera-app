import { TestBed } from '@angular/core/testing';

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
});

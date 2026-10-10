import { AlnumRangePipe } from './alnum-range.pipe';

describe('AlnumRangePipe', () => {
  const pipe = new AlnumRangePipe();

  it('should return null for a missing range', () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeNull();
  });

  it('should return null for a range without start', () => {
    expect(pipe.transform({ a: '' })).toBeNull();
    expect(pipe.transform({})).toBeNull();
  });

  it('should return the start for a single value', () => {
    expect(pipe.transform({ a: '3' })).toBe('3');
    expect(pipe.transform({ a: '3a', b: '3a' })).toBe('3a');
  });

  it('should return start-end for a range', () => {
    expect(pipe.transform({ a: '3', b: '12' })).toBe('3-12');
  });
});

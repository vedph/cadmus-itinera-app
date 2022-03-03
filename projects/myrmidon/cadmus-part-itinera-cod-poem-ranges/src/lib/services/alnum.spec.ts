import { Alnum } from './alnum';

describe('Alnum', () => {
  it('parse "" is null', () => {
    const alnum = Alnum.parse('');
    expect(alnum).toBeNull();
  });

  it('parse null is null', () => {
    const alnum = Alnum.parse(null);
    expect(alnum).toBeNull();
  });

  it('parse "12" is n=12', () => {
    const alnum = Alnum.parse('12');
    expect(alnum).toBeTruthy();
    expect(alnum!.n).toBe(12);
    expect(alnum!.a).toBeNull();
  });

  it('parse "12ab" is n=12 a=ab', () => {
    const alnum = Alnum.parse('12ab');
    expect(alnum).toBeTruthy();
    expect(alnum!.n).toBe(12);
    expect(alnum!.a).toBe('ab');
  });

  it('parse "12ab3" is n=12 a=ab3', () => {
    const alnum = Alnum.parse('12ab3');
    expect(alnum).toBeTruthy();
    expect(alnum!.n).toBe(12);
    expect(alnum!.a).toBe('ab3');
  });

  it('compare "12" lt "13"', () => {
    const a = Alnum.parse('12');
    const b = Alnum.parse('13');
    expect(a!.compare(b)).toBeLessThan(0);
  });

  it('compare "13" gt "12"', () => {
    const a = Alnum.parse('13');
    const b = Alnum.parse('12');
    expect(a!.compare(b)).toBeGreaterThan(0);
  });

  it('compare "12a" lt "13"', () => {
    const a = Alnum.parse('12a');
    const b = Alnum.parse('13');
    expect(a!.compare(b)).toBeLessThan(0);
  });

  it('compare "12" lt "13a"', () => {
    const a = Alnum.parse('12');
    const b = Alnum.parse('13a');
    expect(a!.compare(b)).toBeLessThan(0);
  });

  it('compare "12a" lt "12b"', () => {
    const a = Alnum.parse('12a');
    const b = Alnum.parse('12b');
    expect(a!.compare(b)).toBeLessThan(0);
  });

  it('compare "12b" gt "12a"', () => {
    const a = Alnum.parse('12b');
    const b = Alnum.parse('12a');
    expect(a!.compare(b)).toBeGreaterThan(0);
  });

  it('compare "12" equals "12"', () => {
    const a = Alnum.parse('12');
    const b = Alnum.parse('12');
    expect(a!.compare(b)).toBe(0);
  });

  it('compare "12a" equals "12a"', () => {
    const a = Alnum.parse('12a');
    const b = Alnum.parse('12a');
    expect(a!.compare(b)).toBe(0);
  });
});

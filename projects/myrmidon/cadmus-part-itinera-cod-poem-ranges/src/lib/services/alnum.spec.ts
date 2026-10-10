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

  it('parse "n. 12a" skips the non-digit prefix', () => {
    const a = Alnum.parse('n. 12a');
    expect(a).toEqual(new Alnum(12, 'a'));
  });

  it('parse "alpha" is null', () => {
    expect(Alnum.parse('alpha')).toBeNull();
  });

  it('parse stops at dash or whitespace', () => {
    expect(Alnum.parse('12a-15')).toEqual(new Alnum(12, 'a'));
    expect(Alnum.parse('12a 15')).toEqual(new Alnum(12, 'a'));
  });

  it('constructor defaults to n=0 without suffix', () => {
    const a = new Alnum();
    expect(a.n).toBe(0);
    expect(a.a).toBeNull();
  });

  it('toString joins number and suffix', () => {
    expect(Alnum.toString(new Alnum(12))).toBe('12');
    expect(Alnum.toString(new Alnum(12, 'ab'))).toBe('12ab');
  });

  it('toString omits a zero number', () => {
    expect(Alnum.toString(new Alnum(0, 'x'))).toBe('x');
    expect(Alnum.toString(new Alnum())).toBe('');
  });

  it('compare with null or undefined is gt', () => {
    expect(new Alnum(1).compare(null)).toBe(1);
    expect(new Alnum(1).compare(undefined)).toBe(1);
  });

  it('compare "12a" gt "12"', () => {
    expect(Alnum.parse('12a')!.compare(Alnum.parse('12'))).toBe(1);
  });

  it('compare "12" lt "12a"', () => {
    expect(Alnum.parse('12')!.compare(Alnum.parse('12a'))).toBe(-1);
  });

  it('compareAlnums treats two missing values as equal', () => {
    expect(Alnum.compareAlnums(null, undefined)).toBe(0);
  });

  it('compareAlnums sorts a missing value first', () => {
    expect(Alnum.compareAlnums(null, new Alnum(1))).toBe(-1);
    expect(Alnum.compareAlnums(new Alnum(1), null)).toBe(1);
  });

  it('compareAlnums compares plain objects too', () => {
    // rows may hold deserialized alnums, which are not class instances
    const a = { n: 12, a: 'a' } as Alnum;
    const b = { n: 12, a: 'b' } as Alnum;
    expect(Alnum.compareAlnums(a, b)).toBeLessThan(0);
    expect(Alnum.compareAlnums(b, a)).toBeGreaterThan(0);
    expect(Alnum.compareAlnums(a, { n: 12, a: 'a' } as Alnum)).toBe(0);
  });

  it('sorts numerically, then by suffix', () => {
    const sorted = ['10', '2b', '2', '1', '2a']
      .map((s) => Alnum.parse(s)!)
      .sort(Alnum.compareAlnums)
      .map(Alnum.toString);
    expect(sorted).toEqual(['1', '2', '2a', '2b', '10']);
  });
});

/**
 * A number with an optional alphanumeric tail, or just a string.
 * These alphanumerics are sorted according to the following criteria:
 * - an alphanumeric with only digits (e.g. `12`) is sorted by its numeric
 * value.
 * - an alphanumeric with non-digit characters (e.g. `12a`, `12b1`, etc.)
 * is sorted first by its numeric value, and then alphabetically by
 * its string suffix.
 * - an alphanumeric with no digits is sorted alphabetically.
 */
export class Alnum {
  private static readonly _alnumRegExp = new RegExp('([0-9]+)([^-\\s]*)');

  public n: number;
  public a?: string | null;

  constructor(n = 0, a: string | null = null) {
    this.n = n;
    this.a = a;
  }

  public static parse(text: string | undefined | null): Alnum | null {
    if (!text) {
      return null;
    }
    const m = Alnum._alnumRegExp.exec(text);
    return m ? new Alnum(+m[1], m[2] ? m[2] : null) : null;
  }

  public static toString(nr: Alnum): string {
    const sb: string[] = [];
    if (nr.n) {
      sb.push(nr.n.toString());
    }
    if (nr.a) {
      sb.push(nr.a);
    }
    return sb.join('');
  }

  /**
   * Compare this alphanumeric to the other one.
   * @param other The other alphanumeric.
   * @returns 0=equal, 1=this > other, -1=this < other.
   */
  public compare(other: Alnum | undefined | null): number {
    if (!other) {
      return 1;
    }
    if (this.n !== other.n) {
      return this.n - other.n;
    }
    if (!this.a && !other.a) {
      return 0;
    }
    if (this.a && !other.a) {
      return 1;
    }
    if (!this.a && other.a) {
      return -1;
    }
    return this.a!.localeCompare(other.a!);
  }
}

export class MyDate extends Date {

  //2020-02-01T23:00:00.000Z"
  toJSON(key?: any): string {
      return this.fuelleAuf(this.getFullYear()) + "-" + this.fuelleAuf((this.getMonth() + 1)) + '-' + this.fuelleAuf(this.getDate());
  }

  private fuelleAuf(n: number) {
    return n > 9 ? n.toString() : '0' + n.toString();
  }
}

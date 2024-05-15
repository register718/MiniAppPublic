import { Injectable } from "@angular/core";
import { NativeDateAdapter } from "@angular/material/core";

@Injectable({
  providedIn: 'root'
})

export class CustomDateAdapter extends NativeDateAdapter {

  constructor() {
    super('de');
  }

  parse(value: any): Date | null {
    if (typeof value === 'string') {
      const s = value.split('.');
      if (s.length == 3) {
        const d = new Date(Number(s[2]), Number(s[1]) - 1, Number(s[0]));
        return d;
      }
    }
    return null;
  }

  format(date: Date, displayFormat: Object): string {
    return date.getDate().toString() + "." + (date.getMonth() + 1).toString() + "." + date.getFullYear();
  }
}

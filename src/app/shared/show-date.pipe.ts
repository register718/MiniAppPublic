import { CommonModule } from "@angular/common";
import { NgModule, Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name:'showDate'
})
export class ShowDatePipe implements PipeTransform {
  transform(value: Date, add = 0) : string {
    if (value == null)
      return "dd.mm.yyyy";
    const d = new Date(value.toISOString());
    d.setDate(d.getDate() + add);
    return d.getDate().toString() + '.' + (d.getMonth() + 1).toString() + '.' + d.getFullYear().toString();
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [ShowDatePipe],
  exports: [ShowDatePipe]
})

export class ShowDateModule {}

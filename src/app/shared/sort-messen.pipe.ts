import { CommonModule } from "@angular/common";
import { NgModule, Pipe, PipeTransform } from "@angular/core";
import { IMesse } from "../service/miniplan.service";

@Pipe({
  name:'sortMessen'
})
export class SortMessenPipe implements PipeTransform {
  transform(value: IMesse[]) : IMesse[] {
      return value.sort((a: IMesse, b: IMesse) => {
        let a_num: number = new Date(a.Datum).getTime();
        let b_num: number = new Date(b.Datum).getTime();
        if (a_num === b_num) {
          if (a.explizit === true) {
            return 1;
          } else if (b.explizit === true) {
            return -1;
          }
          return 0;
        }
        if (a_num > b_num)
          return 1;
        else
          return -1;
      });
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [SortMessenPipe],
  exports: [SortMessenPipe]
})

export class SortMessenModule {}

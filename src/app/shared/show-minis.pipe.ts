import { CommonModule } from '@angular/common';
import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { IMiniBasic, MiniService } from '../service/mini.service';


@Pipe({
  name: 'showMinis'
})
export class ShowMinisPipe implements PipeTransform {

  constructor(private miniService: MiniService) {}

  transform(value: IMiniBasic|IMiniBasic[]|number[]|number): string {
    if (value == undefined)
      return 'ERROR';
    let a = '';
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        a +=  this.transformSingle(value[i]) + (i + 1 === value.length ? '' : ', ');
      }
    } else {
      a = this.transformSingle(value);
    }
    if (a.trim() === '') {
      a = 'Unbekannt';
    }
    return a;
  }

  private transformSingle(value: number|IMiniBasic) : string {
    if (typeof value == 'number') {
      return this.miniService.MinisDic[value]?.first_name + ' ' + this.miniService.MinisDic[value]?.last_name;
    } else {
      return value.first_name + ' ' + value.last_name;
    }
  }
}


@NgModule({
  imports: [CommonModule],
  declarations: [ShowMinisPipe],
  exports: [ShowMinisPipe]
})

export class ShowMinisModule {}

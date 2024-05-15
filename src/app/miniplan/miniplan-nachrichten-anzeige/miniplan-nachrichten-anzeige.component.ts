import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DBService } from 'src/app/service/db.service';
import { IPlanBase } from 'src/app/service/miniplan.service';
import { Demultiplexer } from 'src/app/shared/demultiplexer.class';

interface INachricht {Mini: number, Nachricht: string};

@Component({
  selector: 'app-miniplan-nachrichten-anzeige',
  templateUrl: './miniplan-nachrichten-anzeige.component.html',
  styles: [
  ]
})

export class MiniplanNachrichtenAnzeigeComponent implements OnInit, OnDestroy {

  /*_plan: IPlanBase;
  @Input() set Miniplan(val: IPlanBase) {
    if (val == null)
      return;
    if (val.id == -1)
      return;
    this._plan = val;
    this.ladeNachrichten();
  }*/

  private demultiplexer: Demultiplexer = null;

  Nachrichten: INachricht[] = [];

  constructor(private db: DBService) {}

  ngOnInit() {
    const myKeyName = 'gruppe';
    //this.demultiplexer.subscribe('addNotify', (a) => this.addNotify(a), ["notify"])
    const s = this.db.socket.multiplex(
      () => ({'type':myKeyName, 'action':'getNotify'}),
      null, message => message['type'] != undefined && message['type'].startsWith(myKeyName));
    this.demultiplexer = new Demultiplexer(s, myKeyName);
    this.demultiplexer.subscribe('addNotify', (a) => this.ladeNachrichten(a), ['notify']);
    this.demultiplexer.start();
  }

  ngOnDestroy(): void {
    this.demultiplexer.stop();
  }

  ladeNachrichten(data) {
    const n: INachricht = data['notify'];
    this.Nachrichten.push(n);
  }

}

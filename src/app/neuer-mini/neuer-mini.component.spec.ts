import { FormBuilder } from "@angular/forms";
import { DBServiceTest } from "../service/db.service.spec";
import { IMiniBasic, MiniService } from "../service/mini.service";
import { NeuerMiniComponent } from "./neuer-mini.component";

describe('Mini Speichern Testen', () => {

  let db: DBServiceTest
  let c: NeuerMiniComponent;
  let miniService: MiniService;

  beforeAll(() => {
    db = new DBServiceTest();
    db.addGetFunction('mini/basic/', (): IMiniBasic[]=> {
      return [{id:1, Geschwister: 10, MiniTyp: 0, first_name: "Mr", last_name: "X"}]
    });
    miniService = new MiniService(db);
    c = new NeuerMiniComponent(new FormBuilder(), miniService, db);
  });

  /*it('Standart Speichern', () => {
      //c.firstFormGroup.setValue({first_name: "Mrs", last_name: "Unbekannt", geburststdatum: '2012-02-12' });
  });*/
});

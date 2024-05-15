import { ActivatedRoute, Router } from "@angular/router";
import { DBServiceTest } from "src/app/service/db.service.spec";
import { GottesdiensteServiceTest } from "src/app/service/gottesdienste.servie.spec";
import { MiniServiceTest } from "src/app/service/mini.service.spec";
import { MiniplanServiceTest } from "src/app/service/miniplan.service.spec";
import { RouterTest } from "src/app/service/test.class.spec";
import { MiniplantoggleComponent } from "./miniplantoggle.component";

describe('MiniplanToggleComponent', () => {

  let c: MiniplantoggleComponent;
  let miniplanService: MiniplanServiceTest;
  let db: DBServiceTest;
  let gdService: GottesdiensteServiceTest;
  let miniService: MiniServiceTest;

  beforeAll(() => {
    db = new DBServiceTest();
    gdService = new GottesdiensteServiceTest(false);
    miniplanService = new MiniplanServiceTest(db);
    c = new MiniplantoggleComponent(new ActivatedRoute(), new RouterTest(), miniplanService, miniService,gdService);
    c.ngOnInit();
  });

});

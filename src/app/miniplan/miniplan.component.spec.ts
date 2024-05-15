import { DBServiceTest } from "../service/db.service.spec";
import { GottesdiensteService } from "../service/gottesdienste.service";
import { MiniplanService } from "../service/miniplan.service";
import { MiniplanComponent } from "./miniplan.component";

describe('Miniplan Verwaltun', () => {
  let dbService: DBServiceTest;
  let miniplanService: MiniplanService;
  let gdService: GottesdiensteService;
  let c: MiniplanComponent;

  beforeAll(() => {
    dbService = new DBServiceTest();
  });
});

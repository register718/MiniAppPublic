import { DBServiceTest } from "./db.service.spec";
import { GottesdiensteService, IGottesdienst_Art } from "./gottesdienste.service";

describe('Gottesdienst Service', () => {
  let dbService: DBServiceTest;
  let service: GottesdiensteService;

  beforeAll(() => {
    dbService = new DBServiceTest();
    dbService.addGetFunction('gottesdienste/art/all/', () => {
        const list: IGottesdienst_Art[] = [{id: 1, DayOfWeek: 1, MinisInsgesamt: 3, Name: 'Test', OberminisAnzahl: 6, Print: 'QUATSCH', Zeit: '00:00'}];
        return {'data':list}
    });
    dbService.addGetFunction('gottesdienste/messe/all/', () => {
        const list: any[] = [{Art: 1, Datum: '2020-12-12', Info: 'HEy There', Plan_id: 12, explizit: false}];
        return {'data': list};
    });
    service = new GottesdiensteService(dbService);
  });

  it('Check GD Lists', () => {
      expect(service.gd_Art_List_Alt).not.toBeNull();
      expect(service.gd_Art_List_Key_Alt).not.toBeNull();
      expect(service.gd_Art_List_Key_Number).not.toBeNull();
      expect(service.gd_Art_List_Key_Number.length).toBeGreaterThan(0);
      expect(service.gd_Art_List_Alt[service.gd_Art_List_Key_Number[0]]).not.toBeNull();
  });

  it('Check Art Lists', () => {
      expect(service.gd_List_Alt).not.toBeNull();
      expect(service.gd_List_Key).not.toBeNull();
      expect(service.gd_List_Key_Number).not.toBeNull();
      expect(service.gd_List_Key_Number.length).toBeGreaterThan(0);
      expect(service.gd_List_Alt[service.gd_List_Key_Number[0]]).not.toBeNull();
  });
});

export class GottesdiensteServiceTest extends GottesdiensteService {

    artAll: any;
    gdAll: any;
    emtyLists: boolean;

  constructor(emtyLists: boolean) {
    const dbService = new DBServiceTest();
    dbService.addGetFunction('gottesdienste/art/all/', () => {
        return {'data':(emtyLists ? [] : this.artAll)};
    });
    dbService.addGetFunction('gottesdienste/messe/all/', () => {
        return {'data': (emtyLists ? [] : this.gdAll)};
    });
    super(dbService);
    this.artAll = [{id: 1, DayOfWeek: 1, MinisInsgesamt: 3, Name: 'Test', OberminisAnzahl: 6, Print: 'QUATSCH', Zeit: '00:00'}];
    this.gdAll =  [{Art: 1, Datum: '2020-12-12', Info: 'HEy There', Plan_id: 12, explizit: false}];
  }
}

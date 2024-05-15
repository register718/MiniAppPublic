// Hier sollten noch Tests rein

import { of } from "rxjs";
import { DBServiceTest } from "./db.service.spec";
import { MiniplanService } from "./miniplan.service";

export class MiniplanServiceTest extends MiniplanService {

  ladeGrupeeVPlan: any;
  ladeMessenVPlan: any;

  constructor(dbService: DBServiceTest) {
    dbService.addGetFunction('plan/all/', () => {
        return {"data": [{"id": 5, "Name": "Januar Februar", "PlanArt": 0, "StartDatum": "2022-01-09", "EndDatum": "2022-02-28", "DefaultMesseArt_id": null, "PdfExport": ""}, {"id": 6, "Name": "M\u00e4rz April", "PlanArt": 0, "StartDatum": "2022-02-27", "EndDatum": "2022-04-07", "DefaultMesseArt_id": null, "PdfExport": ""}, {"id": 8, "Name": "Ostern 2022", "PlanArt": 1, "StartDatum": "2022-04-09", "EndDatum": "2022-03-18", "DefaultMesseArt_id": null, "PdfExport": ""}, {"id": 9, "Name": "Ostern 2022", "PlanArt": 1, "StartDatum": "2022-04-09", "EndDatum": "2022-03-19", "DefaultMesseArt_id": null, "PdfExport": ""}, {"id": 10, "Name": "Ostern2022", "PlanArt": 1, "StartDatum": "2022-04-10", "EndDatum": "2022-04-18", "DefaultMesseArt_id": null, "PdfExport": ""}]};
    });
    super(dbService);
    this.ladeGrupeeVPlan = {"data": {"97": [], "98": []}, "minis": {}};
    this.ladeMessenVPlan = {"data": [97, 98]};
  }


  ladeMessenVonPlan(planid: number): Promise<any> {
      return of(this.ladeMessenVPlan).toPromise();
  }

  ladeGruppenVonPlan(planid: number): Promise<any> {
    return of(this.ladeGruppenVonPlan).toPromise();
  }

}

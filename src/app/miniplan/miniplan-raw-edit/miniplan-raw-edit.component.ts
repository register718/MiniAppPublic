import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DBService } from 'src/app/service/db.service';
import { IPlanBase, MiniplanService } from 'src/app/service/miniplan.service';

@Component({
  selector: 'app-miniplan-raw-edit',
  templateUrl: './miniplan-raw-edit.component.html',
  styleUrls: ['./miniplan-raw-edit.component.css']
})
export class MiniplanRawEditComponent implements OnInit, OnDestroy {
  planBase: IPlanBase;
  texFile: string;
  pdfSource: string = null;
  showPDF: boolean = true;
  texLogs: string = "";

  planeSub: Subscription = null;

  constructor(private activatedRoute: ActivatedRoute, private miniplanService: MiniplanService, private router: Router, private db: DBService) {}

  ngOnDestroy(): void {
    try{
      this.planeSub.unsubscribe();
    } catch (_err) {
      console.log(_err);
    }
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      if (params.id !== -1 && params.id != null) {
          this.planeSub = this.miniplanService.PlanList.pipe().subscribe(plaene => {
            const id = Number(params.id);
            if (id === this.planBase.id)
              return;
            const p = plaene[id];
            if (p == null) {
              this.router.navigate(['/miniplan']);
            } else {
              this.planBase = p;
              this.loadTex(true);
              this.pdfSource = "../../api/plan/download/" + this.planBase.id.toString() + ".pdf?mode=edit";
            }
          });
      }
    });
  }

  loadTex(edit: boolean) {
    this.db.GET('/plan/raw/get/' + this.planBase.id.toString() + '/?mode=' + (edit ? 'edit' : 'reset')).subscribe((result) => {
      if (typeof(result) === 'string') {
        this.texFile = result;
      }
    });
  }

  btnTexSpeichern() {
    this.showPDF = false;
    this.db.POST('plan/raw/set/' + this.planBase.id.toString() + "/", this.texFile).subscribe((res) => {
        this.showPDF = true;
    });
  }

  loadTexLogs() {
    this.db.GET('plan/raw/logs/?edit&id=' + this.planBase.id.toString()).subscribe((result: string) => {
      this.texLogs = result;
    });
  }
}

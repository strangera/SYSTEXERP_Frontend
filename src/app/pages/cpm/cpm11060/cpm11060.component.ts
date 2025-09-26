import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '@shared/componentkit/table/table.model';

//5.1.1.6 總機廣播服務
@Component({
  selector: 'app-cpm11060',
  templateUrl: './cpm11060.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, TableComponent]
})
export class CPM11060Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
  });
  data: any[] = [];
  columns: Column[] = [
    { field: '', header: '', visible: true },
  ];
  constructor(
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('CPM11060', '/cpm/cpm11060cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // this.cpm11060Service.querycpm11060(frm.value).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
      //   this.data = res.Data;
      //   this.totalRecords = res.TotalCount;
      //   this.queryStateService.setQueryState(this.ProgNo, frm.value);
      // });
    });
  }
}

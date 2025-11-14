import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropDownListService } from './../../../service/utility/dropDownList.service';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  COLUMNS_NATURAL_EDIT,
  COLUMNS_NATURAL_VIEW,
  COLUMNS_CHANGE_EDIT,
  COLUMNS_CHANGE_VIEW,
  COLUMNS_DETAIL_EDIT,
  COLUMNS_DETAIL_VIEW,
  TLS2J030Data
} from '../tls2j030/tls2j030.model';
import { finalize, forkJoin } from 'rxjs';
import { TLS2j030Service } from '@service/api/tls/tls2j030.service';
import { untilDestroyed } from '@ngneat/until-destroy';
@Component({
  selector: 'app-tls2j030-cru',
  templateUrl: './tls2j030-cru.component.html',
  styleUrl: './tls2j030-cru.component.scss',
  standalone: true,
  imports: [
    TableEditComponent, MenubarComponent, NgIf,
    PanelModule, ReactiveFormsModule, ButtonComponent, TranslateModule, InputTextComponent, TableComponent
  ],
})
export class TLS2J030CRUComponent extends BasicCruPageComponent<TLS2J030Data> implements OnInit {
  /** 表單定義 */
  dataForm = this.formBuilder.nonNullable.group({
    TXN_GUIBegNo: ['', [Validators.maxLength(10)]],
  });

  detailNaturalData: any[] = [];  // 來源發票
  detailChangeData: any[] = [];   // 換開發票
  detailItemData: any[] = [];     // 換開發票明細
  selectedItems: TLS2J030Data[] = [];
  data: TLS2J030Data[] = [];

  // 使用 model 檔案中的欄位定義
  columnsnatural = COLUMNS_NATURAL_EDIT;
  columnsNaturalView = COLUMNS_NATURAL_VIEW;
  columnschange = COLUMNS_CHANGE_EDIT;
  columnsChangeView = COLUMNS_CHANGE_VIEW;
  columnsdetail = COLUMNS_DETAIL_EDIT;
  columnsDetailView = COLUMNS_DETAIL_VIEW;

  isViewMode = false;

  constructor(
    private dropDownListService: DropDownListService,
    private route: ActivatedRoute,
    public readonly tls2j030Service: TLS2j030Service,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS2J030', this.dataForm);
    const nav = this.router.getCurrentNavigation();
    const routeRow = nav?.extras?.state?.['rowdata'] as any;
    const row = this.rowdata || routeRow;
    if (row?.CHG_No) {
      this.loadDetails(row.CHG_No);
    }
    this.isViewMode = true;
  }

  loadDetails(chgNo: string) {
    const payload = {
      PageSize: 0,
      PageIndex: 0,
      OrderBy: "",
      Offset: 0,
      SortBy: [],
      CHG_No: chgNo
    };

    this.loading = true;

    forkJoin({
      natural: this.tls2j030Service.queryTLS2J030Detail1(payload),
      change: this.tls2j030Service.queryTLS2J030Detail2(payload),
      item: this.tls2j030Service.queryTLS2J030Detail3(payload),
    })
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          console.log("[CRU] API 調用完成，loading 設為 false");
          this.loading = false;
        })
      )
      .subscribe({
        next: (res) => {
          this.detailNaturalData = res.natural?.Data ?? [];
          this.detailChangeData = res.change?.Data ?? [];
          this.detailItemData = res.item?.Data ?? [];
        },
      });
  }




  /** 送出 */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;

    });
  }
}

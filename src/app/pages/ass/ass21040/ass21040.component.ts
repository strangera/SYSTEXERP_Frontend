import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { ASS21040Service } from '@service/api/ass/ass21040.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-ass21040',
  templateUrl: './ass21040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class ASS21040Component extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    ENG_YYMM: [null, [Validators.required]],
    ENG_Type: [null, [Validators.required]],
    ...createPaginationConfig([{ field: 'ENG_MeterNo', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  // data: any = [];
  // columns: Column[] = [
  //   { field: 'ENG_MeterNo', header: '錶號' },
  //   { field: 'ENG_Type', header: '能源種類' },
  //   { field: 'TLT_Name', header: '專案名稱' },
  //   { field: 'ENG_PriorReading', header: '上次抄錶度數' },
  //   { field: 'ENG_CurrentReading', header: '本次抄錶度數' },
  //   { field: 'ENG_ENG_Usage', header: '本月使用度數' },
  //   { field: 'ENG_Amount', header: '金額合計' },
  // ];
  ENG_TypeOptions: { value: string; label: string }[] = [
    { value: 'G01', label: '水錶' },
    { value: 'G02', label: '電錶' },
    { value: 'G03', label: '瓦斯' },
  ];
  constructor(
    private aSS21040Service: ASS21040Service
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('ASS21040', 'ass/ass21040', this.queryForm, (frm) => this.onSubmit(frm));
  }

  onSubmit(frm: FormGroup) {
    const storeNo = this.authService.currentUserValue?.SYS_StoreNo;
    const mid = this.authService.currentUserValue?.mid;
    if (storeNo && mid) {
      const body = {
        ...frm.value,
        SYS_StoreNo: storeNo,
        Mid: mid,
        EngTypes: frm.value.ENG_Type,
        ClearingYM: frm.value.ENG_YYMM
      };
      this.handleSubmit(frm, () => {
        this.aSS21040Service.ClearingASS21040(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
          if (response.Data.IsClearingSuccess) {
            this.messageService.successBubble('清帳成功');
          }
        });
      });
    }
  }

  onGenerateReport(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const storeNo = this.authService.currentUserValue?.SYS_StoreNo;
      const mid = this.authService.currentUserValue?.mid;
      if (storeNo && mid) {
        const body = {
          SYS_StoreNo: storeNo,
          Mid: Number(mid),
          EngTypes: frm.value.ENG_Type,
          ClearingYM: frm.value.ENG_YYMM
        };
        this.aSS21040Service.printASS21040(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
          if (response.Data.Print_URL) {
            this.messageService.successBubble('列印成功');
          } else {
            this.messageService.errorBubble(response.Message);
          }
        });
      }
    });
  }
}

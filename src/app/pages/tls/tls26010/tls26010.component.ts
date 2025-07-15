import { Component, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
// 共用服務
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { PreorderECRListQuery, TLS26010Service, TLTTALENTQuery } from '../../../service/api/tls/tls26010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls26010',
  templateUrl: './tls26010.component.html',
  styleUrls: ['./tls26010.component.scss'],
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, MultiSelectComponent, DropdownComponent, CalendarRangeComponent, TableComponent, TranslateModule]
})
export class TLS26010Component extends BasicQueryPageComponent<any> {

  // 查詢表單
  queryForm = this.formBuilder.group({
    SYS3800s: [['']],    // 管別
    SYS3900s: [['']],    // 樓層
    ECR_Nos: [['']],     // 收銀機號
    tlt_nos: [['']],     // 專櫃ID
    pod_sdate_S: '', // 起S
    pod_sdate_E: '', // 起E
    pod_edate_S: '', // 迄S
    pod_edate_E: '', // 迄E
  });

  // 監聽變化用
  private sys3800sSignal = toSignal(this.queryForm.get('SYS3800s')!.valueChanges);
  private sys3900sSignal = toSignal(this.queryForm.get('SYS3900s')!.valueChanges);

  // API query
  private quertyPreorderECRList = computed<PreorderECRListQuery>(() => ({
    data_type: '2',
    building_no: Array.from(this.queryForm.value.SYS3800s ? this.queryForm.value.SYS3800s : []),
    floor_no: Array.from(this.queryForm.value.SYS3900s ? this.queryForm.value.SYS3900s : []),
  }));
  private queryTLTTALENT = computed<TLTTALENTQuery>(() => ({
    building_no: Array.from(this.queryForm.value.SYS3800s ? this.queryForm.value.SYS3800s : []),
    floor_no: Array.from(this.queryForm.value.SYS3900s ? this.queryForm.value.SYS3900s : []),
  }));

  columns: { field: string; header: string; visible: boolean; }[] = [
    { field: 'xxx', header: 'xxx', visible: true },
  ];

  constructor(
    public tls26010Service: TLS26010Service,
  ) {
    super();

    // 使用 effect 監聽 signals 變化
    effect(() => {
      this.sys3800sSignal();
      this.sys3900sSignal();

      this.loadDependentData();
    });
  }

  ngOnInit(): void {
    this.initializePage('TLS26010', '/TLS/TLS26010CRU', this.queryForm, this.onSubmit.bind(this));

    console.log(`tls26010 init`);

    // 只載入管別和樓層的下拉選單資料
    this.tls26010Service.loadSYS3800({});
    this.tls26010Service.loadSYS3900({});
  }

  /** 載入依賴於管別和樓層的資料 */
  private loadDependentData(): void {
    this.tls26010Service.loadPreorderECRList(this.quertyPreorderECRList());
    this.tls26010Service.loadTLTTALENT(this.queryTLTTALENT());
  }

  onSubmit(frm: FormGroup): void {
    console.log(`frm:`, [frm]);
  }
}

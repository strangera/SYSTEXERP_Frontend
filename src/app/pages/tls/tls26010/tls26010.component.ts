import { Component, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
// 共用服務
import { NavigationExtras } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { combineLatest, map } from 'rxjs';
import { PreorderECRListQuery, TLS26010Query, TLS26010Service, TLTTALENTQuery } from '../../../service/api/tls/tls26010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column } from '../../../shared/componentkit/table/table.model';

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
    sys3800: [''], // 館別
    sys3900: [''], // 樓層
    ecrNos: [[] as string[]], // 收銀機號
    tltNos: [[] as string[]], // 專櫃ID
    podSdateS: [''], // 起始日期(起)
    podSdateE: [''], // 起始日期(迄)
    podEdateS: [''], // 截止日期(起)
    podEdateE: [''], // 截止日期(迄)
  });

  // 監聽用
  private sys3800Signal = toSignal(this.queryForm.get('sys3800')!.valueChanges);
  private sys3900Signal = toSignal(this.queryForm.get('sys3900')!.valueChanges);
  private ecrNosSignal = toSignal(this.queryForm.get('ecrNos')!.valueChanges);
  private tltNosSignal = toSignal(this.queryForm.get('tltNos')!.valueChanges);

  // 日期監聽與驗證
  private dateValidationSignal = toSignal(combineLatest([
    this.queryForm.get('podSdateS')!.valueChanges,
    this.queryForm.get('podSdateE')!.valueChanges,
    this.queryForm.get('podEdateS')!.valueChanges,
    this.queryForm.get('podEdateE')!.valueChanges
  ]).pipe(
    map(([podSdateS, podSdateE, podEdateS, podEdateE]) => {
      const hasAnyDate = podSdateS || podSdateE || podEdateS || podEdateE;
      if (!hasAnyDate) return { isValid: true, dates: { podSdateS, podSdateE, podEdateS, podEdateE } };

      let isValid = true;

      // 檢查起始日期範圍
      if (podSdateS && podSdateE) {
        const start = new Date(podSdateS);
        const end = new Date(podSdateE);
        if (start > end) isValid = false;
      }

      // 檢查截止日期範圍
      if (podEdateS && podEdateE) {
        const start = new Date(podEdateS);
        const end = new Date(podEdateE);
        if (start > end) isValid = false;
      }

      // 檢查跨範圍邏輯
      if (podSdateE && podEdateS) {
        const podEnd = new Date(podSdateE);
        const edateStart = new Date(podEdateS);
        if (podEnd > edateStart) isValid = false;
      }

      return { isValid, dates: { podSdateS, podSdateE, podEdateS, podEdateE } };
    })
  ), { initialValue: { isValid: true, dates: { podSdateS: '', podSdateE: '', podEdateS: '', podEdateE: '' } } });

  // 監聽館別及樓層變化
  readonly dependentDataEffect = effect(() => {
    const building_no = this.sys3800Signal();
    const floor_no = this.sys3900Signal();
    this.queryForm.patchValue({ ecrNos: [], tltNos: [] });

    if (floor_no) {
      this.tls26010Service.loadPreorderECRList(this.queryPreorderECRList());
      this.tls26010Service.loadTLTTALENT(this.queryTLTTALENT());
    }
  }, { allowSignalWrites: !0 });

  // API queries
  private queryPreorderECRList = computed<PreorderECRListQuery>(() => ({
    data_type: '2',
    building_no: this.sys3800Signal() || '',
    floor_no: this.sys3900Signal() || '',
  }));

  private queryTLTTALENT = computed<TLTTALENTQuery>(() => ({
    building_no: this.sys3800Signal() || '',
    floor_no: this.sys3900Signal() || '',
  }));

  private queryTLS26010 = computed<TLS26010Query>(() => {
    const dateValidation = this.dateValidationSignal();
    const dates = dateValidation.dates;

    return {
      ECR_No: Array.from(this.ecrNosSignal() || []),
      tlt_no: Array.from(this.tltNosSignal() || []),
      pod_sdate_S: dates.podSdateS || '',
      pod_sdate_E: dates.podSdateE || '',
      pod_edate_S: dates.podEdateS || '',
      pod_edate_E: dates.podEdateE || '',
    };
  });

  columns: Column[] = [
    { field: 'pod_no', header: '預售活動編號', visible: true },
    { field: 'pod_desc', header: '活動名稱', visible: true },
    { field: 'pod_sdate', header: '活動起始日期', visible: true },
    { field: 'pod_edate', header: '活動終止日期', visible: true },
    { field: 'pod_status', header: '核准狀態', visible: true },
    { field: 'approved_usr_name', header: '核准人員', visible: true },
    { field: 'approved_date', header: '核准日期', visible: true },
  ];

  constructor(public tls26010Service: TLS26010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26010', '/TLS/TLS26010CRU', this.queryForm, this.onSubmit.bind(this));

    // 只載入館別和樓層的下拉選單資料
    this.tls26010Service.loadSYS3800({});
    this.tls26010Service.loadSYS3900({});
  };

  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
  }

  onClearForm(): void {
    this.queryForm.reset();
    this.tls26010Service.clearData();
  };

  onSubmitQuery(frm: FormGroup): void {
    const dateValidation = this.dateValidationSignal();
    if (!this.sys3900Signal()?.length && dateValidation.isValid) return;
    // 查詢邏輯
    this.onSubmit(frm);
  };

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      if (frm.valid && this.canQuery()) {
        this.tls26010Service.loadTLS26010(this.queryTLS26010());
      }
      this.loading = false;
      this.messageService.blockUi();
    });
  }
}

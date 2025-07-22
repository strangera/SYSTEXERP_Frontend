
import { NgIf } from '@angular/common';
import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS26010Service } from '@service/api/tls/tls26010.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent, CalendarRangeComponent, DropdownComponent, InputTextComponent, MultiSelectComponent, TableComponent } from '@shared/componentkit';
import { MenubarComponent } from '@shared/index';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import { finalize, tap } from 'rxjs';
import { ApprovalStatus, PreorderECRListQuery, TLS26010Data, TLS26010Payload, TLTTALENTQuery } from '../tls26010/tls26010.model';

// 預購活動檔期設定
@Component({
  selector: 'app-tls26010-cru',
  templateUrl: './tls26010-cru.component.html',
  styleUrl: './tls26010-cru.component.scss',
  standalone: true,
  imports: [
    NgIf,
    PanelModule,
    TranslateModule,
    ReactiveFormsModule,
    MenubarComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TableComponent,
    InputTextComponent,
    MultiSelectComponent,
    DropdownComponent,
  ]
})
export class TLS26010CRUComponent extends BasicCruPageComponent<TLS26010Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    pod_no: ['自動給號', [Validators.required, Validators.maxLength(10)]], // 預售活動編號
    pod_desc: ['', [Validators.required, Validators.maxLength(100)]], // 預售名稱
    pod_sdate: [new Date(), Validators.required], // 預售期間(起)
    pod_edate: [new Date(), Validators.required], // 預售期間(迄)
    pod_status: ['未核准'], // 核准狀態
    ECR_Nos: [[] as string[], Validators.required], //收銀機清單
    tlt_nos: [[] as string[], Validators.required], //專櫃清單
    approved_usr_name: [''], // 核准人員
    approved_date: [''], // 核准日期
    sys3800: [''], // 館別
    sys3900: [''], // 樓層
  });

  public CRUDStatus = CRUDStatus;

  private sys3800Signal = toSignal(this.dataForm.get('sys3800')!.valueChanges);
  private sys3900Signal = toSignal(this.dataForm.get('sys3900')!.valueChanges);
  private rowDataSignal = signal<TLS26010Data>({} as TLS26010Data); // 用於存儲表格資料

  // 監聽館別及樓層變化
  readonly dependentDataEffect = effect(() => {
    this.sys3800Signal();
    const floor_no = this.sys3900Signal();
    this.dataForm.patchValue({ ECR_Nos: [], tlt_nos: [] });

    if (floor_no) {
      this.tls26010Service.loadPreorderECRList(this.queryPreorderECRList());
      this.tls26010Service.loadTLTTALENT(this.queryTLTTALENT());
    }
  }, { allowSignalWrites: !0 });

  // API queries
  private queryPreorderECRList = computed<PreorderECRListQuery>(() => ({
    data_type: '2',
    SYS3800s: [{ building_no: this.sys3800Signal() || '' }],
    SYS3900s: [{ floor_no: this.sys3900Signal() || '' }],
  }));

  private queryTLTTALENT = computed<TLTTALENTQuery>(() => ({
    SYS3800s: [{ building_no: this.sys3800Signal() || '' }],
    SYS3900s: [{ floor_no: this.sys3900Signal() || '' }],
  }));

  constructor(public tls26010Service: TLS26010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26010', this.dataForm);

    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

    this.tls26010Service.loadSYS3800({});
    this.tls26010Service.loadSYS3900({});
    this.tls26010Service.loadPreorderECRList({ data_type: '1', SYS3800s: [], SYS3900s: [] });
    this.tls26010Service.loadTLTTALENT({ SYS3800s: [], SYS3900s: [] });

    if (this.isFormEditable) {
      state.rowdata.pod_status = this.tls26010Service.approvalStatus(state.rowdata.pod_status);
      this.tls26010Service.approvalData.set(state?.rowdata?.pod_status);
    }

    this.rowDataSignal.set(state?.rowdata!);

    console.log(`init:`, [this.funInfo, state]);

    switch (state.crudstatus) {
      // 創建
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.crudstatus = CRUDStatus.Create;
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.crudstatus = CRUDStatus.Edit;
        break;
      // 讀檔
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        break;
    }
  }

  onSubmit(frm: FormGroup): void {
    const value: TLS26010FormData = frm.value;
    this.handleSubmit(frm, () => {
      let [tlts, ecrs]: any[][] = [[], []];
      for (const no of value.tlt_nos) {
        if (!this.tls26010Service.TLTMap.has(no)) continue;
        const item = this.tls26010Service.TLTMap.get(no);
        tlts.push({ tlt_no: item?.No, tlt_name: item?.Name });
      }
      for (const no of value.ECR_Nos) {
        if (!this.tls26010Service.ECRMap.has(no)) continue;
        for (const tlt of tlts) ecrs.push({ ECR_No: no, ...tlt });
      }

      const payload: TLS26010Payload = {
        pod_desc: value.pod_desc,
        pod_sdate: value.pod_sdate.toISOString().split('T')[0],
        pod_edate: value.pod_edate.toISOString().split('T')[0],
        pod_status: ApprovalStatus.未核准,
        ECR_Nos: ecrs,
        tlt_nos: tlts,
      };

      console.log(`submit:`, [value, payload]);

      (this.isFormCreateable
        ? this.tls26010Service.insertTLS26010(payload)
        : this.tls26010Service.updateTLS26010(payload)).pipe(
          finalize(() => this.loading = false),
          tap(() => {
            this.messageService.successBubble(this.isFormCreateable ? '新增成功' : '修改成功');
            this.isFormCreateable ? this.dataForm.reset() : this.onCancel();
          })
        ).subscribe();
    });
  }
}

interface TLS26010FormData {
  pod_no: string;
  pod_desc: string;
  pod_sdate: Date;
  pod_edate: Date;
  pod_status: string;
  ECR_Nos: string[];
  tlt_nos: string[];
  approved_usr_name: string;
  approved_date: string;
  sys3800: string;
  sys3900: string;
}

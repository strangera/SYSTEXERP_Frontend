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

  // 使用 computed 來監聽 Service 資料變化
  public ecrTableData = computed(() => this.tls26010Service.ECRTableData());
  public tltTableData = computed(() => this.tls26010Service.TLTTableData());

  // 監聽資料載入狀態
  readonly dataLoadEffect = effect(() => {
    console.log('ECR Table Data updated:', this.ecrTableData());
    console.log('TLT Table Data updated:', this.tltTableData());
  });

  // 監聽館別及樓層變化
  readonly dependentDataEffect = effect(() => {
    const building_no = this.sys3800Signal();
    const floor_no = this.sys3900Signal();

    // 只有在用戶手動選擇樓層時才清空並重新載入
    if (floor_no) {
      this.dataForm.patchValue({ ECR_Nos: [], tlt_nos: [] }, { emitEvent: false });

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

  columns: any[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
  ];

  columns2: any[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
  ];

  constructor(public tls26010Service: TLS26010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26010', this.dataForm);

    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

    console.log(`init:`, [this.funInfo, state]);

    this.tls26010Service.loadSYS3800({});
    this.tls26010Service.loadSYS3900({});

    // 根據 state 中的樓層資料決定是否篩選
    const rowData = state?.rowdata;
    if (rowData?.sys3900) {
      // 有樓層資料時，根據樓層篩選收銀機和專櫃
      this.tls26010Service.loadPreorderECRList({
        data_type: '2',
        SYS3800s: [{ building_no: rowData.sys3800 || '' }],
        SYS3900s: [{ floor_no: rowData.sys3900 }],
      });
      this.tls26010Service.loadTLTTALENT({
        SYS3800s: [{ building_no: rowData.sys3800 || '' }],
        SYS3900s: [{ floor_no: rowData.sys3900 }],
      });

      // 設定表單的館別和樓層值
      this.dataForm.patchValue({
        sys3800: rowData.sys3800 || '',
        sys3900: rowData.sys3900
      }, { emitEvent: false });
    } else {
      // 沒有樓層資料時，載入所有資料（不篩選）
      this.tls26010Service.loadPreorderECRList({ data_type: '1', SYS3800s: [], SYS3900s: [] });
      this.tls26010Service.loadTLTTALENT({ SYS3800s: [], SYS3900s: [] });
    }

    if (this.isFormEditable && rowData) {
      rowData.pod_status = this.tls26010Service.approvalStatus(rowData.pod_status);
      this.tls26010Service.approvalData.set(rowData.pod_status);

      // 載入既有的表單資料（編輯模式）
      this.dataForm.patchValue({
        pod_no: rowData.pod_no || '自動給號',
        pod_desc: rowData.pod_desc || '',
        pod_sdate: rowData.pod_sdate ? new Date(rowData.pod_sdate) : new Date(),
        pod_edate: rowData.pod_edate ? new Date(rowData.pod_edate) : new Date(),
        pod_status: rowData.pod_status || '未核准',
        ECR_Nos: rowData.ECR_Nos || [],
        tlt_nos: rowData.tlt_nos || [],
        approved_usr_name: rowData.approved_usr_name || '',
        approved_date: rowData.approved_date || '',
      }, { emitEvent: false });
    }

    this.rowDataSignal.set(rowData || {} as TLS26010Data);

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

      const payload: TLS26010Payload = {
        pod_desc: value.pod_desc,
        pod_sdate: value.pod_sdate.toISOString().split('T')[0],
        pod_edate: value.pod_edate.toISOString().split('T')[0],
        pod_status: ApprovalStatus.未核准,
        ECR_Nos: this.ecrTableData(),
        tlt_nos: this.tltTableData(),
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

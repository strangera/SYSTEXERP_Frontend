import { NgIf } from '@angular/common';
import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS26010Service } from '@service/api/tls/tls26010.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent, CalendarRangeComponent, DialogComponent, DropdownComponent, InputTextComponent, MultiSelectComponent, TableComponent } from '@shared/componentkit';
import { Column } from '@shared/componentkit/table/table.model';
import { MenubarComponent } from '@shared/index';
import { ApprovalStatus } from '@shared/models';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import { combineLatest, finalize, tap } from 'rxjs';
import { ECRTableData, QueryPayload, TLS26010Data, TLS26010Payload, TLTTALENTData } from '../tls26010/tls26010.model';

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
    FileUploadModule,
    MenubarComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TableComponent,
    InputTextComponent,
    MultiSelectComponent,
    DropdownComponent,
    DialogComponent,
  ]
})
export class TLS26010CRUComponent extends BasicCruPageComponent<TLS26010Data> implements OnInit {
  public CRUDStatus = CRUDStatus;
  public get isRead() { return this.crudstatus === CRUDStatus.Read; }
  public ecrTableFiltered: ECRTableData[] = [];
  public tltTableFiltered: TLTTALENTData[] = [];
  public dialogVisible = signal<'ecr' | 'tlt' | null>(null);
  private dialogLoading = signal<boolean>(!1);

  public dataForm = this.formBuilder.nonNullable.group({
    pod_no: ['自動給號'], // 預售活動編號
    pod_desc: ['', [Validators.required, Validators.maxLength(100)]], // 預售名稱
    pod_sdate: [new Date(), Validators.required], // 預售期間(起)
    pod_edate: [new Date(), Validators.required], // 預售期間(迄)
    pod_status: ['未核准'], // 核准狀態
    ECR_Nos: [[] as string[]], //收銀機清單
    tlt_nos: [[] as string[]], //專櫃清單
    sys3800: [''], // 館別
    sys3900: [[] as string[]], // 樓層
  });
  private get df() { return this.dataForm.controls; }

  private sys3800Signal = toSignal(this.df.sys3800.valueChanges);
  private sys3900Signal = toSignal(this.df.sys3900.valueChanges);
  private sdateSignal = toSignal(this.df.pod_sdate.valueChanges);
  private edateSignal = toSignal(this.df.pod_edate.valueChanges);

  private dateCheck = effect(() => {
    const sdate = this.sdateSignal();
    const edate = this.edateSignal();

    if (sdate && edate && sdate > edate) {
      this.df.pod_edate.setErrors({ dateError: true });
      this.service.loadPreorderECRList({ ...this.queryPayload(), data_type: '1' }).subscribe();
    } else {
      this.df.pod_edate.setErrors(null);
    }
  });
  private DialogEffect = effect(() => {
    console.log(`DialogEffect:`, [this.dataForm.value]);
    if (this.dialogVisible() === 'ecr') this.service.loadPreorderECRList({ ...this.queryPayload(), data_type: '1' }).subscribe();
    if (this.dialogVisible() === 'tlt') this.service.loadTLTTALENT(this.queryPayload()).subscribe();
  }, { allowSignalWrites: true });

  // API queries
  private queryPayload = computed<QueryPayload>(() => {
    const sdate = this.sdateSignal();
    const edate = this.edateSignal();
    const sys3800 = this.sys3800Signal();
    const sys3900 = this.sys3900Signal();

    // 確保日期值存在且為有效的 Date 物件
    const startDate = sdate instanceof Date ? sdate : this.df.pod_sdate.value;
    const endDate = edate instanceof Date ? edate : this.df.pod_edate.value;

    return {
      building_no: sys3800 || '',
      floor_no: sys3900 || '',
      sdate: startDate instanceof Date ? startDate.toISOString().split('T')[0] : '',
      edate: endDate instanceof Date ? endDate.toISOString().split('T')[0] : '',
    };
  });

  columns: Column[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
  ];

  columns2: Column[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
  ];

  constructor(public service: TLS26010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26010', this.dataForm);

    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

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

    const rowData = state?.rowdata;

    if (this.isFormEditable && rowData) {
      rowData.pod_status = this.service.approvalStatus(rowData.pod_status);

      // 載入既有的表單資料（編輯模式）
      this.dataForm.patchValue({
        pod_no: rowData.pod_no || '自動給號',
        pod_desc: rowData.pod_desc || '',
        pod_sdate: rowData.pod_sdate ? new Date(rowData.pod_sdate) : new Date(),
        pod_edate: rowData.pod_edate ? new Date(rowData.pod_edate) : new Date(),
        pod_status: rowData.pod_status || '未核准',
        sys3800: rowData.sys3800 || '',
        sys3900: rowData.sys3900 || [],
        ECR_Nos: rowData.ECR_Nos || [],
        tlt_nos: rowData.tlt_nos || [],
      });
    }

    this.service.loadSYS3800();
    this.service.loadSYS3900();

    combineLatest([
      this.service.loadPreorderECRList({ ...this.queryPayload(), data_type: '1' }),
      this.service.loadTLTTALENT(this.queryPayload()),
    ]).pipe(
      tap(() => { this.tableFilter(); }),
      finalize(() => { console.log(`init:`, [this.funInfo, state, this.dataForm.value]); }),
    ).subscribe();
  }

  /** 處理文件上傳事件 */
  onImportExcel(event: FileSelectEvent): void {
    const file = event.files[0];
    this.service.importTLS26010(file);
  }

  // 下載範例檔案
  onExportExcel() {
    this.service.downloadTemplate();
  }

  onSubmit(frm: FormGroup): void {
    const value: TLS26010FormData = frm.value;
    this.handleSubmit(frm, () => {

      const payload: TLS26010Payload = {
        pod_desc: value.pod_desc,
        pod_sdate: value.pod_sdate.toISOString().split('T')[0],
        pod_edate: value.pod_edate.toISOString().split('T')[0],
        pod_status: ApprovalStatus.未核准,
        ECR_Nos: value.ECR_Nos,
        tlt_nos: value.tlt_nos,
        // ECR_Nos: this.service.ECRTableData(),
        // tlt_nos: this.service.TLTTableData(),
      };

      console.log(`submit:`, [value, payload]);

      (this.isFormCreateable
        ? this.service.insertTLS26010(payload)
        : this.service.updateTLS26010(payload)).pipe(
          finalize(() => this.loading = false),
          tap(() => {
            this.messageService.successBubble(this.isFormCreateable ? '新增成功' : '修改成功');
            this.isFormCreateable ? this.dataForm.reset() : this.onCancel();
          })
        ).subscribe();
    });
  }

  private tableFilter(): void {
    console.log(`table filter:`, [this.dataForm.value]);
    this.ecrTableFiltered = this.service.ECRTableData()
      .filter(ecr => this.df.ECR_Nos.value.includes(ecr.ECR_No));
    this.tltTableFiltered = this.service.TLTTableData()
      .filter(tlt => this.df.tlt_nos.value.includes(tlt.tlt_no));
  };

  saveDialog(frm: FormGroup): void {
    console.log(`saveDialog:`, [frm.value, this.dataForm.value]);
    this.tableFilter();
    this.dialogVisible.set(null);
    this.dialogLoading.set(!1);

    // this.handleSubmit(frm, () => {
    //   this.service.updateTLS26010({
    //     pod_desc: df.pod_desc.value || '',
    //     pod_sdate: df.pod_sdate.value.toISOString().split('T')[0],
    //     pod_edate: df.pod_edate.value.toISOString().split('T')[0],
    //     pod_status: '0',
    //     ECR_Nos: df.ECR_Nos.value,
    //     tlt_nos: df.tlt_nos.value,
    //   }).pipe(
    //     finalize(() => {
    //       this.dialogLoading.set(!1);
    //       this.ECRDialogVisible.set(!1);
    //       this.TLTDialogVisible.set(!1);
    //     }),
    //     tap(res => {
    //       this.dataForm.patchValue({
    //         ECR_Nos: df.ECR_Nos.value,
    //         tlt_nos: df.tlt_nos.value,
    //       });
    //       this.tableFilter();
    //       this.messageService.successBubble(this.isFormCreateable ? '新增成功' : '修改成功');
    //       this.isFormCreateable ? this.dataForm.reset() : this.onCancel();
    //     })
    //   ).subscribe();
    // });
  };
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

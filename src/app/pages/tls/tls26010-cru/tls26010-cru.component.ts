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
import { DropdownChangeEvent } from 'primeng/dropdown';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import { finalize, tap } from 'rxjs';
import { ECRTableData, TLS26010Data, TLS26010Payload, TLTTALENTData } from '../tls26010/tls26010.model';

const shallowEqual = <T extends Record<string, any>>(a: T, b: T): boolean => {
  const keys = Object.keys(a) as (keyof T)[];
  return keys.every((k: keyof T) => a[k] === b[k]);
};

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
  public ecrTableFiltered: ECRTableData[] = [];
  public tltTableFiltered: TLTTALENTData[] = [];
  public dialogVisible = signal<'ecr' | 'tlt' | false>(!1);
  private dialogLoading = signal<boolean>(!1);

  public dataForm = this.formBuilder.nonNullable.group({
    pod_no: ['自動給號'], // 預售活動編號
    pod_desc: ['', [Validators.required, Validators.maxLength(100)]], // 預售名稱
    pod_sdate: [new Date(), Validators.required], // 預售期間(起)
    pod_edate: [new Date(), Validators.required], // 預售期間(迄)
    pod_busdate: [new Date(), Validators.required], // 活動正檔日期
    pod_status: ['未核准'], // 核准狀態
    ECR_Nos: [[] as string[]], //收銀機清單
    tlt_nos: [[] as string[]], //專櫃清單
    sys3800: [''], // 館別
    sys3900: [''], // 樓層
  });
  private get df() { return this.dataForm.controls; }

  public get podStatus() {
    const statusSet = new Set(['0', '1', '9']);
    const podStatus = this.dataForm.controls.pod_status;
    podStatus.patchValue(statusSet.has(podStatus.value)
      ? this.service.approvalStatus(podStatus.value)
      : podStatus.value || '未核准');
    return podStatus;
  }

  private sys3800Signal = toSignal(this.df.sys3800.valueChanges);
  private sys3900Signal = toSignal(this.df.sys3900.valueChanges);
  private sdateSignal = toSignal(this.df.pod_sdate.valueChanges);
  private edateSignal = toSignal(this.df.pod_edate.valueChanges);

  private readonly dateCheckEffect = effect(() => {
    const sdate = this.sdateSignal();
    const edate = this.edateSignal();
    const payload = this.queryPayload();
    if (sdate && edate && sdate > edate) {
      this.df.pod_edate.setErrors({ dateError: true });
      this.service.loadPreorderECRList({ ...payload, data_type: '1' });
    } else { this.df.pod_edate.setErrors(null); }
  });
  private readonly ecrDialogOpenEffect = effect(() => {
    const dialog = this.dialogVisible();
    if (dialog !== 'ecr') return;
    this.service.loadSYS3800();
    this.service.loadSYS3900();
    const payload = this.queryPayload();
    this.service.loadPreorderECRList({ ...payload, data_type: '1' });

    console.log('ecrDialogOpenEffect:', [this.dataForm.value, payload, dialog]);
  }, { allowSignalWrites: true });
  private readonly tltDialogOpenEffect = effect(() => {
    const dialog = this.dialogVisible();
    if (dialog !== 'tlt') return;
    this.service.loadSYS3800();
    this.service.loadSYS3900();
    const payload = this.queryPayload();
    this.service.loadTLTTALENT(payload);

    console.log('tltDialogOpenEffect:', [this.dataForm.value, payload, dialog]);
  }, { allowSignalWrites: true });
  private readonly ecrTableDataFilterEffect = effect(() => {
    this.ecrTableFiltered = this.service.ECRTableData()
      .filter(ecr => this.df.ECR_Nos.value.includes(ecr.ECR_No));
  });
  private readonly tltTableDataFilterEffect = effect(() => {
    this.tltTableFiltered = this.service.TLTTableData()
      .filter(tlt => this.df.tlt_nos.value.includes(tlt.tlt_no));
  });
  private readonly TLS26010DetailEffect = effect(() => {
    this.dataForm.patchValue({
      ECR_Nos: this.service.TLS26010Detail().ecr_list.map(ecr => ecr.ECR_No),
      tlt_nos: this.service.TLS26010Detail().talent_list.map(tlt => tlt.tlt_no),
    });
    this.ecrTableFiltered = this.service.TLS26010Detail().ecr_list;
    this.tltTableFiltered = this.service.TLS26010Detail().talent_list;
  });

  // API queries
  private readonly queryPayload = computed(() => ({
    building_no: this.sys3800Signal(),
    floor_no: this.sys3900Signal(),
    sdate: this.sdateSignal()!,
    edate: this.edateSignal()!,
  }), { equal: shallowEqual });

  public columns: Column[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
  ];

  public columns2: Column[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
  ];

  public readonly isRowSelectable = (rowData: TLS26010Data): boolean =>
    !(Reflect.has(rowData, 'CanDelete') && rowData.CanDelete === '0');

  constructor(public service: TLS26010Service) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS26010', this.dataForm);
    if (this.crudstatus !== CRUDStatus.Create)
      this.service.loadTLS26010Detail({ pod_no: this.rowdata?.pod_no || '' });
    console.log(`init:`, [this.funInfo, this.rowdata, this.dataForm.value]);
  }

  /** 處理文件上傳事件 */
  public onImportExcel(event: FileSelectEvent): void {
    const file = event.files[0];
    this.service.importTLS26010(file);
  }

  // 下載範例檔案
  public onExportExcel() {
    this.service.downloadTemplate();
  }

  public onSubmit(frm: FormGroup): void {
    const value = frm.value;
    this.handleSubmit(frm, () => {

      const payload: TLS26010Payload = {
        pod_desc: value.pod_desc,
        pod_sdate: value.pod_sdate,
        pod_edate: value.pod_edate,
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

  dialogChange(event: DropdownChangeEvent): void {
    console.log(`dialogChange:`, [event]);
    if (event && event.value?.lenth) {
      this.dataForm.patchValue({ sys3800: '', sys3900: '' });
      if (this.dialogVisible() === 'ecr') this.df.ECR_Nos.patchValue([]);
      if (this.dialogVisible() === 'tlt') this.df.tlt_nos.patchValue([]);
    }
  }

  public saveDialog(frm: FormGroup): void {
    console.log(`saveDialog:`, [frm.value, this.dataForm.value]);
    this.handleSubmit(frm, () => {
      this.service.updateTLS26010({
        pod_desc: this.df.pod_desc.value || '',
        pod_sdate: this.df.pod_sdate.value,
        pod_edate: this.df.pod_edate.value,
        pod_status: '0',
        ECR_Nos: this.df.ECR_Nos.value,
        tlt_nos: this.df.tlt_nos.value,
      }).pipe(
        finalize(() => {
          this.dialogLoading.set(!1);
          this.dialogVisible.set(!1);
          this.service.loadTLS26010Detail({ pod_no: this.rowdata?.pod_no || '' });
        }),
        tap(res => {
          this.dataForm.patchValue({
            ECR_Nos: this.df.ECR_Nos.value,
            tlt_nos: this.df.tlt_nos.value,
          });
          this.messageService.successBubble(this.isFormCreateable ? '新增成功' : '修改成功');
          this.isFormCreateable ? this.dataForm.reset() : this.onCancel();
          console.log(`update:`, [res, this.dataForm.value, this.isFormCreateable]);
        })
      ).subscribe();
    });
  };
}

interface DataForm {
  pod_no: string;
  pod_desc: string;
  pod_sdate: Date;
  pod_edate: Date;
  pod_busdate: Date;
  pod_status: string;
  ECR_Nos: string[];
  tlt_nos: string[];
  approved_usr_name: string;
  approved_date: string;
  sys3800: string;
  sys3900: string;
}

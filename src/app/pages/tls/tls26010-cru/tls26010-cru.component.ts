import { TLS26010Service } from '@service/api/tls/tls26010.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { ValidationService } from './../../../shared/service/validation.service';
// --Commonly used imports--
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { EcrItem, TltItem } from '@pages/tls/tls26010/tls26010.model';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { PanelModule } from 'primeng/panel';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { apiOption, option } from '../../../shared/models/sys/sysb000.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

// 擴展 EcrItem 加上 id 和 status
export interface EcrItemWithStatus extends EcrItem {
  id?: number;
  ECR_Name?: string;
  status?: 'original' | 'new' | 'modify' | 'delete' | 'deleted';
}

// 擴展 TltItem 加上 id 和 status
export interface TltItemWithStatus extends TltItem {
  id?: number;
  status?: 'original' | 'new' | 'modify' | 'delete' | 'deleted';
}

export interface tls26010response {
  id: number;
  pod_no: string;
  pod_desc: string;
  pod_sdate: Date;
  pod_edate: Date;
  pod_status: string;
  approved_usr_name?: string;
  approved_date?: Date;
  CanDelete?: number;
  CanEdit?: number;
}

// 預購活動檔期設定
@Component({
  selector: 'app-tls26010-cru',
  templateUrl: './tls26010-cru.component.html',
  styleUrl: './tls26010-cru.component.scss',
  standalone: true,
  imports: [
    TableComponent,
    TableEditComponent,
    TranslateModule,
    MenubarComponent,
    MultiSelectComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    CalendarRangeComponent,
    CommonModule,
    DropdownComponent,
    DialogComponent,
    RadiobuttonComponent,
    EditorTextComponent,
    ExpandableEditTableComponent,
    InputTextComponent,
    InputNumberComponent,
    EditorTextComponent,
    NgFor,
    ButtonComponent,
    NgIf
  ]
})
export class TLS26010CRUComponent extends BasicCruPageComponent<tls26010response> implements OnInit {
  @ViewChild('ecrTable') ecrTable!: ExpandableEditTableComponent;

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [{ value: null as number | null, disabled: true }],
    pod_no: ['', [Validators.required]],
    pod_desc: ['', [Validators.required, Validators.maxLength(100)]],
    pod_sdate: [null as Date | null, [Validators.required, this.validationService.dateAfterTodayValidator()]],
    pod_edate: [null as Date | null, [Validators.required]],
    pod_status: [''],
    approved_usr_name: [''],
    approved_date: [null as Date | null],
    CanDelete: [null as number | null],
    CanEdit: [null as number | null]
  });

  // #region 收銀機明細
  ecrData: EcrItemWithStatus[] = [];
  orgEcrData: EcrItemWithStatus[] = [];
  selectedECRItems: EcrItemWithStatus[] = [];
  ecrLoading = false;

  defaultNewECR: EcrItemWithStatus = {
    id: undefined,
    ECR_No: '',
    ECR_Name: '',
    ecr_name: '',
    tlt_no: '',
    tlt_name: '',
    status: 'new'
  };

  ecrColumn: EditColumn[] = [
    { field: 'ECR_No', header: '收銀機編號', type: 'input', width: '12rem', disabled: () => true },
    { field: 'ECR_Name', header: '收銀機名稱', type: 'input', width: '12rem', disabled: () => true }
  ];

  createDefaultNewECR() {
    this.defaultNewECR = {
      id: undefined,
      ECR_No: '',
      ECR_Name: '',
      ecr_name: '',
      tlt_no: '',
      tlt_name: '',
      status: 'new'
    };
  }

  // #region 專櫃明細
  tltData: TltItemWithStatus[] = [];
  orgTltData: TltItemWithStatus[] = [];
  selectedTLTItems: TltItemWithStatus[] = [];
  tltLoading = false;

  defaultNewTLT: TltItemWithStatus = {
    id: undefined,
    tlt_no: '',
    tlt_name: '',
    status: 'new'
  };

  tltColumn: EditColumn[] = [
    { field: 'tlt_no', header: '專櫃編號', type: 'input', width: '12rem', disabled: () => true },
    { field: 'tlt_name', header: '專櫃名稱', type: 'input', width: '12rem', disabled: () => true }
  ];

  createDefaultNewTLT() {
    this.defaultNewTLT = {
      id: undefined,
      tlt_no: '',
      tlt_name: '',
      status: 'new'
    };
  }

  // #region 彈出視窗設定
  ecrDialogForm = this.formBuilder.nonNullable.group({
    sys3800: [''],
    sys3900: [''],
    sys3A00: [''],
    ecr_no: [''],
    tlt_no: ['']
  });

  tltDialogForm = this.formBuilder.nonNullable.group({
    sys3800: [[] as string[]],
    sys3900: [[] as string[]],
    sys3A00: [[] as string[]],
    tlt_no: [''],
    tlt_name: ['']
  });

  ecrDialogVisible = false;
  tltDialogVisible = false;

  ecrDialogLoading = false;
  tltDialogLoading = false;
  ecrDialogData: EcrItemWithStatus[] = [];
  tltDialogData: TltItemWithStatus[] = [];
  ecrDialogSelected: EcrItemWithStatus[] = [];
  tltDialogSelected: TltItemWithStatus[] = [];

  ecrDialogColumn: Column[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'ecr_name', header: '收銀機名稱', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
  ];

  tltDialogColumn: Column[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
  ];

  building_Option: apiOption[] = [];
  floor_Option: apiOption[] = [];
  area_Option: apiOption[] = [];

  pod_status_Option: option[] = [
    { value: "0", label: '未核准' },
    { value: "1", label: '已核准' }
  ];

  // ----------------------------------------------------------------
  constructor(
    private validationService: ValidationService,
    private tLS26010Service: TLS26010Service,
    private dropDownListService: DropDownListService,
    private datePipe: DatePipe,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26010', this.dataForm);
    this.loadOptions();

    const pod_no = this.dataForm.get('pod_no')?.value;
    if (pod_no) {
      this.loadDetailData(pod_no);
    } else {
      if (this.crudstatus != CRUDStatus.Create)
        console.warn('無法讀取明細資料');
    }

    this.setupAutoReloadForECR();
    this.setupAutoReloadForTLT();

    this.dataForm.get('pod_sdate')?.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        if (this.tltDialogVisible) this.loadTLTDialogData();
      });

    this.dataForm.get('pod_edate')?.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        if (this.tltDialogVisible) this.loadTLTDialogData();
      });
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      this.messageService.errorBubble('請填寫必填欄位');
      return;
    }

    const formValue = frm.getRawValue();

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          const insertBody = {
            pod_info: {
              pod_desc: formValue.pod_desc,
              pod_sdate: formValue.pod_sdate,
              pod_edate: formValue.pod_edate
            },
            ecr_list: this.ecrData
              .filter(item => item.status !== 'delete' && item.status !== 'deleted')
              .map(item => ({
                ECR_No: item.ECR_No!,
                ecr_name: item.ecr_name || item.ECR_Name || '',
                tlt_no: item.tlt_no!,
                tlt_name: item.tlt_name || ''
              })),
            talent_list: this.tltData
              .filter(item => item.status !== 'delete' && item.status !== 'deleted')
              .map(item => ({
                tlt_no: item.tlt_no!,
                tlt_name: item.tlt_name || ''
              }))
          };

          console.log('新增請求:', JSON.stringify(insertBody, null, 2));

          this.tLS26010Service.insertTLS26010(insertBody).pipe(untilDestroyed(this)).subscribe({
            next: (response) => {
              this.messageService.unblockUi();
              if (response.Status === '0000') {
                this.messageService.successBubble('新增成功');
                this.onCancel();
              } else {
                this.messageService.errorBubble(`新增失敗: ${response.Message}`);
              }
              this.submitted = false;
            },
            error: (error) => {
              this.messageService.unblockUi();
              this.messageService.errorBubble(`新增發生錯誤: ${error.message}`);
              this.submitted = false;
            }
          });
        } else {
          this.messageService.unblockUi();
          this.submitted = false;
        }
        break;

      case CRUDStatus.Edit:
        if (this.canEdit()) {
          const updateBody = {
            pod_info: {
              id: formValue.id,
              pod_no: formValue.pod_no,
              pod_desc: formValue.pod_desc,
              pod_sdate: formValue.pod_sdate,
              pod_edate: formValue.pod_edate,
              pod_status: formValue.pod_status
            },
            ecr_list: this.processEcrListForUpdate(),
            talent_list: this.processTltListForUpdate()
          };

          console.log('更新請求:', JSON.stringify(updateBody, null, 2));

          this.http.post<{ Status: string; Message: string }>(`${this.tLS26010Service.apiUrl}/updateTLS26010`, updateBody)
            .pipe(untilDestroyed(this))
            .subscribe({
              next: (response) => {
                this.messageService.unblockUi();
                if (response.Status === '0000') {
                  this.messageService.successBubble('更新成功');
                  this.onCancel();
                } else {
                  this.messageService.errorBubble(`更新失敗: ${response.Message}`);
                }
                this.submitted = false;
              },
              error: (error) => {
                this.messageService.unblockUi();
                this.messageService.errorBubble(`更新發生錯誤: ${error.message}`);
                this.submitted = false;
              }
            });
        } else {
          this.messageService.unblockUi();
          this.submitted = false;
        }
        break;

      default:
        this.messageService.unblockUi();
        this.submitted = false;
        break;
    }
  }

  private processEcrListForUpdate() {
    return this.ecrData.map(item => {
      let status = 'original';
      if (item.status === 'new') {
        status = 'new';
      } else if (item.status === 'delete' || item.status === 'deleted') {
        status = 'delete';
      } else if (item.status === 'modify') {
        status = 'modify';
      }

      return {
        id: item.id ?? null,
        ECR_No: item.ECR_No!,
        tlt_no: item.tlt_no!,
        Status: status
      };
    });
  }

  private processTltListForUpdate() {
    return this.tltData.map(item => {
      let status = 'original';
      if (item.status === 'new') {
        status = 'new';
      } else if (item.status === 'delete' || item.status === 'deleted') {
        status = 'delete';
      } else if (item.status === 'modify') {
        status = 'modify';
      }

      return {
        id: item.id ?? null,
        tlt_no: item.tlt_no!,
        Status: status
      };
    });
  }

  loadOptions() {
    this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe((response) => {
      this.building_Option = response.Data.map((item: { No: string; Name: string }) => ({
        No: item.No,
        Name: item.Name,
        Label: item.No + '/' + item.Name,
      }));
    });

    this.dropDownListService.querySYS3900_DropDownList().pipe(untilDestroyed(this)).subscribe((response) => {
      this.floor_Option = response.Data.map((item: { No: string; Name: string }) => ({
        No: item.No,
        Name: item.Name,
        Label: item.No + '/' + item.Name,
      }));
    });

    this.dropDownListService.querySYS3A00_DropDownList().pipe(untilDestroyed(this)).subscribe((response) => {
      this.area_Option = response.Data.map((item: { No: string; Name: string }) => ({
        No: item.No,
        Name: item.Name,
        Label: item.No + '/' + item.Name,
      }));
    });
  }

  async loadDetailData(pod_no: string): Promise<void> {
    console.log('要求pod_no資料:', pod_no);
    this.tLS26010Service.loadTLS26010Detail({ "pod_no": pod_no }).pipe(untilDestroyed(this)).subscribe((response) => {
      if (response.Status === '0000') {
        console.log('取得明細資料:', response.Data);

        this.ecrData = (response.Data.ecr_list || []).map((item: EcrItem & { id?: number; ECR_Name?: string }) => ({
          id: item.id,
          ECR_No: item.ECR_No,
          ECR_Name: item.ECR_Name || '',
          ecr_name: item.ecr_name || item.ECR_Name || '',
          tlt_no: item.tlt_no,
          tlt_name: item.tlt_name,
          status: 'original' as const
        }));

        console.log('📊 主畫面 ecrData 載入完成:', this.ecrData);
        console.log('📊 ecrData 的 ECR_No:', this.ecrData.map(d => d.ECR_No));
        console.log('📊 ecrData 的 id:', this.ecrData.map(d => d.id));

        // 檢查 ECR_No 是否有重複或空值
        const mainEcrNos = this.ecrData.map(d => d.ECR_No);
        const uniqueMainEcrNos = new Set(mainEcrNos);
        console.log('⚠️ 主畫面 ECR_No 數量:', mainEcrNos.length, '唯一數量:', uniqueMainEcrNos.size);
        if (mainEcrNos.length !== uniqueMainEcrNos.size) {
          console.error('❌ 主畫面發現重複的 ECR_No！', mainEcrNos);
        }
        if (mainEcrNos.some(no => !no)) {
          console.error('❌ 主畫面有空的 ECR_No！', mainEcrNos);
        }

        this.tltData = (response.Data.talent_list || []).map((item: TltItem & { id?: number }) => ({
          id: item.id,
          talent_id: item.id || item.talent_id,
          tlt_no: item.tlt_no,
          tlt_name: item.tlt_name,
          status: 'original' as const
        }));

        this.orgEcrData = JSON.parse(JSON.stringify(this.ecrData));
        this.orgTltData = JSON.parse(JSON.stringify(this.tltData));

        this.ecrDialogSelected = [...this.ecrData];
        this.tltDialogSelected = [...this.tltData];

        console.log('取得ECR明細:', this.ecrData);
        console.log('取得TLT明細:', this.tltData);

      } else {
        this.messageService.errorBubble(`讀取失敗: ${response.Message}`);
      }
    });
  }

  dialogVisible(dialogMode: string) {
    if (dialogMode == 'ecr') {
      this.ecrDialogVisible = true;
      this.tltDialogVisible = false;
      this.loadECRDialogData();
    } else {
      this.ecrDialogVisible = false;
      this.tltDialogVisible = true;
      this.loadTLTDialogData();
    }
  }

  onDialogECRSubmit(): void {
    console.log('舊的ECR ecrData', this.ecrData);
    const added: EcrItemWithStatus[] = [];

    this.ecrDialogSelected.forEach(item => {
      const exists = this.ecrData.find(d =>
        d.ECR_No === item.ECR_No &&
        d.status !== 'delete' &&
        d.status !== 'deleted'
      );
      if (!exists) {
        added.push({
          id: undefined,
          ECR_No: item.ECR_No,
          ECR_Name: item.ECR_Name,
          ecr_name: item.ecr_name,
          tlt_no: item.tlt_no,
          tlt_name: item.tlt_name,
          status: 'new'
        });
      }
    });

    this.ecrData = [...this.ecrData.filter(item => item.status !== 'delete' && item.status !== 'deleted'), ...added];

    console.log('新的ECR ecrData', this.ecrData);

    this.ecrDialogVisible = false;
  }

  private isLoadingEcrDialog = false;

  onSelectionECRChange(event: EcrItemWithStatus[]): void {
    console.log('🔔 onSelectionECRChange 被觸發');
    console.log('  - isLoadingEcrDialog:', this.isLoadingEcrDialog);
    console.log('  - event.length:', event.length);
    console.log('  - event:', event);
    console.log('  - event 的 ECR_No:', event.map(d => d.ECR_No));

    // 如果正在載入 Dialog 資料，忽略自動觸發的空陣列事件
    if (this.isLoadingEcrDialog && event.length === 0) {
      console.log('⚠️ 忽略 ECR Dialog 初始化時的空選擇事件');
      return;
    }

    // 檢查 event 中是否有重複的 ECR_No
    const eventEcrNos = event.map(d => d.ECR_No);
    const uniqueEventEcrNos = new Set(eventEcrNos);
    if (eventEcrNos.length !== uniqueEventEcrNos.size) {
      console.error('❌ event 中有重複的 ECR_No！', eventEcrNos);
    }

    this.ecrDialogSelected = event;
    console.log('✅ ecr dialog選擇變更', this.ecrDialogSelected);
    console.log('✅ 選擇的 ECR_No:', this.ecrDialogSelected.map(d => d.ECR_No));
  }

  onDialogTLTSubmit(): void {
    console.log('舊的TLT tltData', this.tltData);
    const added: TltItemWithStatus[] = [];

    this.tltDialogSelected.forEach(item => {
      const exists = this.tltData.find(d =>
        d.tlt_no === item.tlt_no &&
        d.status !== 'delete' &&
        d.status !== 'deleted'
      );
      if (!exists) {
        added.push({
          id: undefined,
          tlt_no: item.tlt_no,
          tlt_name: item.tlt_name,
          talent_id: item.talent_id,
          status: 'new'
        });
      }
    });

    this.tltData = [...this.tltData.filter(item => item.status !== 'delete' && item.status !== 'deleted'), ...added];
    console.log('新的 tltData', this.tltData);

    this.tltDialogVisible = false;
  }

  private isLoadingTltDialog = false;

  onSelectionTLTChange(event: TltItemWithStatus[]): void {
    // 如果正在載入 Dialog 資料，忽略自動觸發的空陣列事件
    if (this.isLoadingTltDialog && event.length === 0) {
      console.log('⚠️ 忽略 TLT Dialog 初始化時的空選擇事件');
      return;
    }
    this.tltDialogSelected = event;
    console.log('tlt dialog選擇變更', this.tltDialogSelected);
  }

  private setupAutoReloadForECR(): void {
    this.ecrDialogForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        untilDestroyed(this)
      )
      .subscribe(() => {
        if (this.ecrDialogVisible) {
          this.loadECRDialogData();
        }
      });
  }

  private setupAutoReloadForTLT(): void {
    this.tltDialogForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        untilDestroyed(this)
      )
      .subscribe(() => {
        if (this.tltDialogVisible) {
          this.loadTLTDialogData();
        }
      });
  }

  loadECRDialogData(): void {
    this.ecrDialogLoading = true;
    this.isLoadingEcrDialog = true; // 設定旗標

    const req = {
      building_no: this.ecrDialogForm.value.sys3800,
      floor_no: this.ecrDialogForm.value.sys3900,
      area_no: this.ecrDialogForm.value.sys3A00,
      ecr_type: '1',
      ecr_no: this.ecrDialogForm.value.ecr_no || null,
      tlt_no: this.ecrDialogForm.value.tlt_no || null,
    };

    console.log('收銀機 Dialog request', req);
    this.tLS26010Service.queryECRDropDownList(req)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response) => {
          console.log('取得 ECR Dialog 完整回應:', response);
          console.log('response.Data 內容:', response.Data);
          if (response.Status === '0000' && response.Data && response.Data.length > 0) {
            console.log('第一筆資料範例:', response.Data[0]);
            this.ecrDialogData = response.Data.map((item: EcrItem & { ecr_no?: string; ECR_Name?: string }) => {
              const mapped = {
                ...item,
                ECR_No: item.ecr_no || item.ECR_No || '',
                ECR_Name: item.ECR_Name || item.ecr_name || '',
                ecr_name: item.ecr_name || item.ECR_Name || '',
                tlt_no: item.tlt_no || '',
                tlt_name: item.tlt_name || ''
              };
              return mapped;
            });
            console.log('取得 ECR選單表 (已 mapping):', this.ecrDialogData);
            console.log('ECR選單表第一筆:', this.ecrDialogData[0]);

            // 檢查 ECR_No 是否有重複
            const ecrNos = this.ecrDialogData.map(d => d.ECR_No);
            const uniqueEcrNos = new Set(ecrNos);
            console.log('⚠️ ECR_No 數量:', ecrNos.length, '唯一數量:', uniqueEcrNos.size);
            if (ecrNos.length !== uniqueEcrNos.size) {
              console.error('❌ 發現重複的 ECR_No！', ecrNos);
            }

            // 設定已選擇的項目：從 ecrData 中找出對應的 Dialog 資料項目
            // 使用 setTimeout 確保 table 的 ngOnChanges 執行完畢後再設定選擇項目
            // 延遲 200ms 確保 table 已經初始化並清空選擇
            setTimeout(() => {
              console.log('=== 開始比對 ECR ===');
              console.log('ecrData:', this.ecrData);
              console.log('ecrDialogData:', this.ecrDialogData);

              // 建立 ECR_No 的 Set 以加快查找速度
              const existingEcrNos = new Set(
                this.ecrData
                  .filter(item => item.status !== 'delete' && item.status !== 'deleted')
                  .map(item => item.ECR_No)
              );

              console.log('existingEcrNos Set:', existingEcrNos);

              // 使用 ecrDialogData 中的確切物件參考
              this.ecrDialogSelected = this.ecrDialogData.filter(dialogItem => {
                const isSelected = existingEcrNos.has(dialogItem.ECR_No);
                if (isSelected) {
                  console.log(`✓ 找到匹配: dialogItem.ECR_No="${dialogItem.ECR_No}"`);
                }
                return isSelected;
              });

              console.log('已選擇的 ECR 項目:', this.ecrDialogSelected);
              console.log('已選擇的 ECR_No:', this.ecrDialogSelected.map(d => d.ECR_No));
              console.log('ecrDialogSelected 物件引用檢查:', this.ecrDialogSelected.map(d => ({
                ECR_No: d.ECR_No,
                sameRef: this.ecrDialogData.includes(d)
              })));

              // 手動觸發變更檢測
              this.cdr.detectChanges();

              // 重置旗標，允許後續的選擇變更
              setTimeout(() => {
                this.isLoadingEcrDialog = false;
                console.log('✅ ECR Dialog 載入完成，已重置旗標');
              }, 100);
            }, 200);  // 延遲 200ms，確保 table 的 ngOnChanges 執行完畢
          } else {
            this.ecrDialogData = [];
            this.isLoadingEcrDialog = false;
            console.warn('查詢收銀機資料失敗或無資料:', response.Message || '無資料');
          }
          this.ecrDialogLoading = false;
        },
        error: (error) => {
          console.error('查詢收銀機資料發生錯誤:', error);
          this.messageService.errorBubble('查詢收銀機資料失敗');
          this.ecrDialogData = [];
          this.ecrDialogLoading = false;
          this.isLoadingEcrDialog = false;
        }
      });
  }

  loadTLTDialogData(): void {
    this.tltDialogLoading = true;
    this.isLoadingTltDialog = true; // 設定旗標

    const sData = this.dataForm.get('pod_sdate')?.value;
    const eDate = this.dataForm.get('pod_edate')?.value;

    if (!sData) {
      this.messageService.errorBubble('請先輸入起始日期')
      this.tltDialogLoading = false;
      this.isLoadingTltDialog = false;
      return;
    }

    const req = {
      building_nos: this.tltDialogForm.value.sys3800,
      floor_nos: this.tltDialogForm.value.sys3900,
      area_nos: this.tltDialogForm.value.sys3A00,
      tlt_openflag: '',
      tlt_no: this.tltDialogForm.value.tlt_no || null,
      tlt_name: this.tltDialogForm.value.tlt_name || null,
      ven_no: '',
      tlt_bdate: this.datePipe.transform(sData, 'yyyy-MM-dd'),
      tlt_edate: this.datePipe.transform(eDate, 'yyyy-MM-dd') ?? null,
    };

    console.log('專櫃 Dialog request', req);
    this.tLS26010Service.queryTalentDropDownList(req)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response) => {
          if (response.Status === '0000' && response.Data) {
            this.tltDialogData = response.Data.map((item: TltItem) => ({
              ...item,
              id: item.talent_id
            }));
            console.log('取得 TLT選單表:', this.tltDialogData);

            // 設定已選擇的項目：從 tltData 中找出對應的 Dialog 資料項目
            // 使用 setTimeout 確保 table 的 ngOnChanges 執行完畢後再設定選擇項目
            // 延遲 200ms 確保 table 已經初始化並清空選擇
            setTimeout(() => {
              console.log('=== 開始比對 TLT ===');
              console.log('tltData:', this.tltData);
              console.log('tltDialogData:', this.tltDialogData);

              // 建立 tlt_no 的 Set 以加快查找速度
              const existingTltNos = new Set(
                this.tltData
                  .filter(item => item.status !== 'delete' && item.status !== 'deleted')
                  .map(item => item.tlt_no)
              );

              console.log('existingTltNos Set:', existingTltNos);

              // 使用 tltDialogData 中的確切物件參考
              this.tltDialogSelected = this.tltDialogData.filter(dialogItem => {
                const isSelected = existingTltNos.has(dialogItem.tlt_no);
                if (isSelected) {
                  console.log(`✓ 找到匹配: dialogItem.tlt_no="${dialogItem.tlt_no}"`);
                }
                return isSelected;
              });

              console.log('已選擇的 TLT 項目:', this.tltDialogSelected);
              console.log('已選擇的 tlt_no:', this.tltDialogSelected.map(d => d.tlt_no));
              console.log('tltDialogSelected 物件引用檢查:', this.tltDialogSelected.map(d => ({
                tlt_no: d.tlt_no,
                sameRef: this.tltDialogData.includes(d)
              })));

              // 手動觸發變更檢測
              this.cdr.detectChanges();

              // 重置旗標，允許後續的選擇變更
              setTimeout(() => {
                this.isLoadingTltDialog = false;
                console.log('✅ TLT Dialog 載入完成，已重置旗標');
              }, 100);
            }, 200);  // 延遲 200ms，確保 table 的 ngOnChanges 執行完畢
          } else {
            this.tltDialogData = [];
            this.isLoadingTltDialog = false;
            console.warn('查詢專櫃資料失敗或無資料:', response.Message);
          }
          this.tltDialogLoading = false;
        },
        error: (error) => {
          console.error('查詢專櫃資料發生錯誤:', error);
          this.messageService.errorBubble('查詢專櫃資料失敗');
          this.tltDialogData = [];
          this.tltDialogLoading = false;
          this.isLoadingTltDialog = false;
        }
      });
  }

  validateECR = (rowData: EcrItemWithStatus): { isValid: boolean; errorMessage: string } => {
    if (!rowData.ECR_No) {
      return { isValid: false, errorMessage: '收銀機編號不可為空' };
    }

    const duplicate = this.ecrData.some(
      item => item.ECR_No === rowData.ECR_No &&
        item !== rowData &&
        item.status !== 'deleted' &&
        item.status !== 'delete'
    );

    if (duplicate) {
      return { isValid: false, errorMessage: '收銀機編號不可重複' };
    }

    return { isValid: true, errorMessage: '' };
  };

  validateTLT = (rowData: TltItemWithStatus): { isValid: boolean; errorMessage: string } => {
    if (!rowData.tlt_no) {
      return { isValid: false, errorMessage: '專櫃編號不可為空' };
    }

    const duplicate = this.tltData.some(
      item => item.tlt_no === rowData.tlt_no &&
        item !== rowData &&
        item.status !== 'deleted' &&
        item.status !== 'delete'
    );

    if (duplicate) {
      return { isValid: false, errorMessage: '專櫃編號不可重複' };
    }
    return { isValid: true, errorMessage: '' };
  };

  reset26010() {
    if (this.crudstatus == CRUDStatus.Create) {
      this.ecrData = [];
      this.tltData = [];
      this.messageService.infoBubble('新增模式重製完成');
    } else if (this.crudstatus == CRUDStatus.Edit) {
      if (this.orgEcrData && this.orgTltData) {
        this.ecrData = JSON.parse(JSON.stringify(this.orgEcrData));
        this.tltData = JSON.parse(JSON.stringify(this.orgTltData));
        this.messageService.infoBubble('編輯模式重製完成');
      }
    } else {
      console.log('查看模式無須重製');
    }
  }
}

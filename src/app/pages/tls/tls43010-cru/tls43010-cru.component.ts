import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { NgIf } from '@angular/common';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { QueryTls43010Response, Tls43010Service } from '@service/api/tls/tls43010.service';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { SystemOptionsService } from '@service/system/sys1000.service';
import { SystemOption } from '@shared/models/sys/sys1000.model';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { Column } from '@shared/componentkit/table-edit/table-edit.model';
import { GalleriaModule } from 'primeng/galleria';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  name: string;
}

@Component({
  selector: 'app-tls43010-cru',
  templateUrl: './tls43010-cru.component.html',
  styleUrls: ['./tls43010-cru.component.scss'],
  standalone: true,
  imports: [
    InputTextareaComponent,
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    CalendarComponent,
    DropdownComponent,
    InputNumberComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
    FileUploadModule,
    ButtonModule,
    TableEditComponent,
    GalleriaModule
  ]
})
export class TLS43010CRUComponent extends BasicCruPageComponent<QueryTls43010Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    NOT_No: [{ value: '系統自動給號', disabled: true }], // 通告編號
    NOT_Date: [{ value: new Date(), disabled: true }, [Validators.required]], // 通告日期
    NOT_BegDate: [null as null | Date, [Validators.required]], // 有效開始日期時間
    NOT_EndDate: [null as null | Date, [Validators.required]], // 有效結束日期時間
    NOT_Priority: [0, [Validators.required, Validators.min(0), Validators.max(9)]], // 優先順序，預設值為0(在同一段時間的優先順序9-0, 9最優先)
    NOT_Status: [{ value: '0', disabled: true }], // 狀態 0=未確認(未審核) 1=已確認(已審核) 2=已刪除
    NOT_PlayTime: [30, [Validators.min(0), Validators.max(999999)]], // 媒體檔播放秒數，預設值為30
    NOT_DtlLimit: ['0'], // 是否限制播放條件，POS50012 0=不限制(預設值) 1=符合明細設定的機台才播放 2=不符合明細設定的機台才播放*
    // NOT_File: ['', [Validators.required, Validators.maxLength(200)]], // 媒體檔案名稱
    NOT_Note: ['', [Validators.maxLength(255)]], // 備註
  });
  uploadedFiles: any[] = [];
  today = new Date();
  NOT_Status_Options: { value: string, label: string }[] = [ // 0=未確認(未審核) 1=已確認(已審核) 2=已刪除
    { value: '0', label: '未審核' },
    { value: '1', label: '已審核' },
    { value: '2', label: '已刪除' },
  ];
  /*  0=不限制(預設值)*/
  /*  1=符合明細設定的機台才播放*/
  /*  2=不符合明細設定的機台才播放*/
  NOT_DtlLimit_Options: { value: string, label: string }[] = [
    { value: '0', label: '不限制' },
    { value: '1', label: '符合明細設定的機台才播放' },
    { value: '2', label: '不符合明細設定的機台才播放' },
  ];
  data: any[] = [];
  selectedItems: any[] = [];
  // 如果機台群組編號有值那其他要disable，反之亦然
  columns: Column[] = [
    { field: 'NOT_SeqNo', header: '通告序號', format: (value) => this.isFormCreateable ? '自動給號' : value, disabled: (rowData) => this.isOtherGroupSelected(rowData) },
    { field: 'ECR_No', header: '收銀機號', type: 'dropdown', optionLabel: 'label', optionValue: 'No', disabled: (rowData) => this.isOtherGroupSelected(rowData) },
    { field: 'TLT_No', header: '專櫃編號', type: 'dropdown', optionLabel: 'label', optionValue: 'No', disabled: (rowData) => this.isOtherGroupSelected(rowData) },
    { field: 'ECR_Type', header: '機台類型', type: 'dropdown', optionLabel: 'SYS_Name', optionValue: 'SYS_Code', disabled: (rowData) => this.isOtherGroupSelected(rowData) },
    { field: 'ECR_GrpNo', header: '機台群組編號', type: 'dropdown', optionLabel: 'label', optionValue: 'No', disabled: (rowData) => this.isEcrGrpNoSelected(rowData) },
    { field: 'BUILDING_No', header: '館別', type: 'dropdown', optionLabel: 'Name', optionValue: 'No', disabled: (rowData) => this.isOtherGroupSelected(rowData) },
    { field: 'FLOOR_No', header: '樓層', type: 'dropdown', optionLabel: 'Name', optionValue: 'No', disabled: (rowData) => this.isOtherGroupSelected(rowData) },
    { field: 'Area_No', header: '區域', type: 'dropdown', optionLabel: 'Name', optionValue: 'No', disabled: (rowData) => this.isOtherGroupSelected(rowData) },
  ];
  // 檢查其他互斥欄位是否有值
  isOtherGroupSelected(rowData: any): boolean {
    return !!(rowData['ECR_GrpNo'] && rowData['ECR_GrpNo'] !== '');
  }
  // 檢查機台群組編號是否有值
  isEcrGrpNoSelected(rowData: any): boolean {
    return !!(rowData['ECR_No'] || rowData['TLT_No'] || rowData['ECR_Type'] || rowData['BUILDING_No'] || rowData['FLOOR_No'] || rowData['Area_No']);
  }
  hiddenTable = true;

  // ----------------------------------------------------------------
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls43010Service: Tls43010Service
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS43010', this.dataForm);
    this.loadDropdownOptions();
    if (this.dataForm.get('NOT_Status')?.value === '1') {
      this.dataForm.disable();
    }
    this.dataForm.get('NOT_DtlLimit')?.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
      if (value === '1' || value === '2') {
        this.hiddenTable = false;
      } else {
        this.hiddenTable = true;
      }
    })
    if (!this.isFormCreateable) {
      this.dataForm.get('NOT_DtlLimit')?.setValue(this.rowdata?.NOT_DtlLimit || '0');
    }
  }
  loadDropdownOptions() {
    this.dropDownListService.queryPOS1002_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.setColumnOptions('ECR_No', options.Data.map(item => ({ ...item, label: item.No + ' - ' + item.Name })));
    });
    this.dropDownListService.queryTLTTALENT_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.setColumnOptions('TLT_No', options.Data.map(item => ({ ...item, label: item.No + ' - ' + item.Name })));
    });
    this.setColumnOptions('ECR_Type', SystemOptionsService.getOptions('ECR_Type'));
    this.dropDownListService.queryPOS1002GRM_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.setColumnOptions('ECR_GrpNo', options.Data.map(item => ({ ...item, label: item.No + ' - ' + item.Name })));
    });
    this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.setColumnOptions('BUILDING_No', options.Data);
    });
    this.dropDownListService.querySYS3900_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.setColumnOptions('FLOOR_No', options.Data);
    });
    this.dropDownListService.querySYS3A00_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.setColumnOptions('Area_No', options.Data);
    });
  }
  setColumnOptions(field: string, options: IDropdownItem[] | SystemOption[]) {
    const column = this.columns.find(col => col.field === field);
    if (column) { column.options = options; }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
      }
    });
  }
  validateEntireRow(rowData: any) {
    if (!rowData.ECR_No && !rowData.TLT_No && !rowData.ECR_Type && !rowData.ECR_GrpNo && !rowData.BUILDING_No && !rowData.FLOOR_No && !rowData.Area_No) {
      return { isValid: false, errorMessage: '至少其中一個有值' };
    }
    return { isValid: true, errorMessage: '' };
  }
  // !!! 以下為可參考之新方法
  mediaItems = signal<MediaItem[]>([]);
  visible = signal(false);
  onFileSelect(event: any) {
    const file: File = event.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileUrl = e.target?.result as string;
        let fileType: 'image' | 'video';
        if (['bmp', 'jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          fileType = 'image';
        } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
          fileType = 'video';
        } else {
          return;
        }
        this.mediaItems.set([{
          url: fileUrl,
          type: fileType,
          name: file.name
        }]);
        this.visible.set(true);
      };
      reader.readAsDataURL(file);
    }
  }
}

import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { Component, OnInit, signal, ViewChild } from '@angular/core';
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
import { IUTls43010Request, QueryTls43010Response, Tls43010Detail, Tls43010Service } from '@service/api/tls/tls43010.service';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { SystemOptionsService } from '@service/system/sys1000.service';
import { SystemOption } from '@shared/models/sys/sys1000.model';
import { FileSelectEvent, FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { GalleriaModule } from 'primeng/galleria';
import { finalize, forkJoin } from 'rxjs';
import { ImageQueryRequest, ImageService } from '@service/utility/image.service';
import { environment } from 'src/environments/environment';

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
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  dataForm = this.formBuilder.nonNullable.group({
    NOT_No: [{ value: '系統自動給號', disabled: true }], // 通告編號
    NOT_Date: [{ value: new Date(), disabled: true }, [Validators.required]], // 通告日期
    NOT_BegDate: [null as null | Date, [Validators.required]], // 有效開始日期時間
    NOT_EndDate: [null as null | Date, [Validators.required]], // 有效結束日期時間
    NOT_Priority: [0, [Validators.required, Validators.min(0), Validators.max(9)]], // 優先順序，預設值為0(在同一段時間的優先順序9-0, 9最優先)
    NOT_Status: [{ value: '0', disabled: true }], // 狀態 0=未確認(未審核) 1=已確認(已審核) 2=已刪除
    NOT_PlayTime: [30, [Validators.min(0), Validators.max(999999)]], // 媒體檔播放秒數，預設值為30
    NOT_DtlLimit: ['0'], // 是否限制播放條件，POS50012 0=不限制(預設值) 1=符合明細設定的機台才播放 2=不符合明細設定的機台才播放*
    NOT_Note: ['', [Validators.maxLength(255)]], // 備註
  });
  uploadedFiles: any[] = [];
  today = new Date();
  NOT_Status_Options: { value: string, label: string }[] = [ // 0=未確認(未審核) 1=已確認(已審核) 2=已刪除
    { value: '0', label: '未審核' },
    { value: '1', label: '已審核' },
    { value: '2', label: '已刪除' },
  ];
  NOT_DtlLimit_Options: { value: string, label: string }[] = [
    { value: '0', label: '不限制' },
    { value: '1', label: '符合明細設定的機台才播放' },
    { value: '2', label: '不符合明細設定的機台才播放' },
  ];
  data: Tls43010Detail[] = [];
  selectedItems: Tls43010Detail[] = [];
  // 如果機台群組編號有值那其他要disable，反之亦然
  columns: EditColumn[] = [
    { field: 'NOT_SeqNo', header: '通告序號', format: (value, index, rowData) => rowData.status === 'new' ? '自動給號' : value, disabled: (value, index, rowData) => this.isOtherGroupSelected(rowData) },
    { field: 'ECR_No', header: '收銀機號', type: 'dropdown', width: '100%', optionLabel: 'label', optionValue: 'No', disabled: (value, index, rowData) => this.isOtherGroupSelected(rowData) },
    { field: 'TLT_No', header: '專櫃編號', type: 'dropdown', width: '100%', optionLabel: 'label', optionValue: 'No', disabled: (value, index, rowData) => this.isOtherGroupSelected(rowData) },
    { field: 'ECR_Type', header: '機台類型', type: 'dropdown', width: '100%', optionLabel: 'SYS_Name', optionValue: 'SYS_Code', disabled: (value, index, rowData) => this.isOtherGroupSelected(rowData) },
    { field: 'ECR_GrpNo', header: '機台群組編號', type: 'dropdown', width: '100%', optionLabel: 'label', optionValue: 'No', disabled: (value, index, rowData) => this.isEcrGrpNoSelected(rowData) },
    { field: 'BUILDING_No', header: '館別', type: 'dropdown', width: '100%', optionLabel: 'Name', optionValue: 'No', disabled: (value, index, rowData) => this.isOtherGroupSelected(rowData) },
    { field: 'FLOOR_No', header: '樓層', type: 'dropdown', width: '100%', optionLabel: 'Name', optionValue: 'No', disabled: (value, index, rowData) => this.isOtherGroupSelected(rowData) },
    { field: 'Area_No', header: '區域', type: 'dropdown', width: '100%', optionLabel: 'Name', optionValue: 'No', disabled: (value, index, rowData) => this.isOtherGroupSelected(rowData) },
  ];
  // 檢查其他互斥欄位是否有值
  isOtherGroupSelected(rowData: Tls43010Detail): boolean {
    return !!(rowData?.['ECR_GrpNo'] && rowData?.['ECR_GrpNo'] !== '');
  }
  // 檢查機台群組編號是否有值
  isEcrGrpNoSelected(rowData: Tls43010Detail): boolean {
    return !!(rowData?.['ECR_No'] || rowData?.['TLT_No'] || rowData?.['ECR_Type'] || rowData?.['BUILDING_No'] || rowData?.['FLOOR_No'] || rowData?.['Area_No']);
  }
  hiddenTable = signal(true);
  mediaItems = signal<MediaItem[]>([]);
  visible = signal(false);
  // ----------------------------------------------------------------
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls43010Service: Tls43010Service,
    private readonly imageService: ImageService
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
        this.hiddenTable.set(false);
      } else {
        this.hiddenTable.set(true);
      }
    })
    if (!this.isFormCreateable) {
      this.dataForm.get('NOT_DtlLimit')?.setValue(this.rowdata?.NOT_DtlLimit || '0');
      this.data = this.rowdata?.Details || [];
      this.queryImages();
    }
  }
  loadDropdownOptions() {
    this.setColumnOptions('ECR_Type', SystemOptionsService.getOptions('ECR_Type'));
    const dropDownRequests = [
      this.dropDownListService.queryPOS1002_DropDownList(),
      this.dropDownListService.queryTLTTALENT_DropDownList(),
      this.dropDownListService.queryPOS1002GRM_DropDownList(),
      this.dropDownListService.querySYS3800_DropDownList(),
      this.dropDownListService.querySYS3900_DropDownList(),
      this.dropDownListService.querySYS3A00_DropDownList()
    ];
    this.loading = true;
    forkJoin(dropDownRequests).pipe(untilDestroyed(this), finalize(() => { this.loading = false; })
    ).subscribe(results => {
      const pos1002Options = results[0];
      const tltTalentOptions = results[1];
      const pos1002grmOptions = results[2];
      const sys3800Options = results[3];
      const sys3900Options = results[4];
      const sys3a00Options = results[5];
      this.setColumnOptions('ECR_No', pos1002Options.Data.map(item => ({ ...item, label: item.No + ' - ' + item.Name })));
      this.setColumnOptions('TLT_No', tltTalentOptions.Data.map(item => ({ ...item, label: item.No + ' - ' + item.Name })));
      this.setColumnOptions('ECR_GrpNo', pos1002grmOptions.Data.map(item => ({ ...item, label: item.No + ' - ' + item.Name })));
      this.setColumnOptions('BUILDING_No', sys3800Options.Data.map(item => ({ ...item, label: item.No + ' - ' + item.Name })));
      this.setColumnOptions('FLOOR_No', sys3900Options.Data.map(item => ({ ...item, label: item.No + ' - ' + item.Name })));
      this.setColumnOptions('Area_No', sys3a00Options.Data.map(item => ({ ...item, label: item.No + ' - ' + item.Name })));
    });
  }
  queryImages() {
    const queryRequest: ImageQueryRequest = {
      IMG_Type: 'POS50011',
      IMG_SeqNo: this.rowdata?.NOT_No || ''
    };

    this.imageService.queryImages(queryRequest).subscribe(res => {
      // 檢查是否有回傳資料
      if (!res.Data || res.Data.length === 0) {
        this.mediaItems.set([]); // 清空預覽
        return;
      }

      // 處理所有回傳的圖片
      const items: MediaItem[] = res.Data.map(fileData => {
        const fileExtension = fileData.IMG_File.split('.').pop()?.toLowerCase() || '';
        let fileType: 'image' | 'video';
        if (['bmp', 'jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          fileType = 'image';
        } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
          fileType = 'video';
        } else {
          // 如果檔案類型不符合，回傳 null 或 undefined，稍後過濾掉
          return null;
        }
        return {
          url: `${environment.ApiUrl}/${fileData.IMG_Path.replace('~', '')}/${fileData.IMG_File}`,
          type: fileType,
          name: fileData.IMG_File
        };
      }).filter(item => item !== null) as MediaItem[]; // 過濾掉無效的檔案

      this.mediaItems.set(items);
    });
  }
  setColumnOptions(field: string, options: IDropdownItem[] | SystemOption[]) {
    const column = this.columns.find(col => col.field === field);
    if (column) { column.options = options; }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const tableValid = this.tableEditComponent.validateAndShowErrors();
      if (!tableValid) {
        this.loading = false;
        return;
      }
      // 檢查是否有選取檔案
      if (this.uploadedFiles.length === 0 && this.mediaItems().length === 0) {
        this.messageService.errorBubble('請選擇要上傳的媒體檔案。');
        this.loading = false;
        return;
      }
      // 建立 FormData 物件，用於發送 multipart/form-data
      const formData = new FormData();
      // 將檔案加到 FormData 中
      this.uploadedFiles.forEach(file => {
        formData.append('files', file, file.name);
      });
      // 將表單資料加到 FormData 中。
      // 這裡我們將整個 JSON 物件轉成字串，再傳送到後端。
      // 後端 Controller 負責解析這個字串。
      const requestData = {
        ...frm.getRawValue(),
        ID: this.rowdata?.ID || 0,
        Detail: this.dataForm.get('NOT_DtlLimit')?.value !== '0' ? this.data.filter(item => !item['_isAutoInsertCandidate']).map(item => ({
          ID: this.isFormCreateable ? 0 : item['ID'],
          ...item
        })) : undefined,
      } as IUTls43010Request;

      // 將資料物件序列化成 JSON 字串，並附加到 FormData
      formData.append('request', JSON.stringify(requestData));

      this.loading = true;

      // 呼叫新的服務方法
      const $res = this.isFormCreateable
        ? this.tls43010Service.insertTLS43010(formData)
        : this.tls43010Service.updateTLS43010(formData); // 更新不需要上傳檔案，所以保持原樣

      $res.pipe(
        finalize(() => this.loading = false)
      ).subscribe({
        next: res => {
          this.messageService.successBubble(res.Message || `${this.isFormCreateable ? '新增成功' : '修改成功'}`);
          if (this.isFormCreateable) {
            this.dataForm.reset();
            this.data = [];
            this.uploadedFiles = [];
            this.mediaItems.set([]);
            this.fileUpload.clear();
          } else {
            this.onCancel();
          }
        },
        error: err => {
          this.messageService.errorBubble(err.Message || `${this.isFormCreateable ? '新增失敗' : '修改失敗'}`);
        }
      });
    });
  }
  validateEntireRow(rowData: Tls43010Detail) {
    if (!rowData.ECR_No && !rowData.TLT_No && !rowData.ECR_Type && !rowData.ECR_GrpNo && !rowData.BUILDING_No && !rowData.FLOOR_No && !rowData.Area_No) {
      return { isValid: false, errorMessage: '至少其中一個有值' };
    }
    return { isValid: true, errorMessage: '' };
  }
  onSelectFile(event: FileSelectEvent) {
    this.uploadedFiles = [...event.files];// 將 FileList 轉換成陣列並賦值給 uploadedFiles
    // 確保只處理單一檔案
    if (this.uploadedFiles.length > 0) {
      const file = this.uploadedFiles[0];
      const fileName = file.name;
      // 觸發預覽邏輯
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
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
      };
      reader.readAsDataURL(file);
    } else {
      // 如果沒有檔案被選取，清空預覽和檔案名稱
      this.mediaItems.set([]);
    }
  }
}

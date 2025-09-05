import { DropDownListService } from '@service/utility/dropDownList.service';
import { Component, OnInit, signal } from '@angular/core';
import { Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { NgIf } from '@angular/common';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { SystemOptionsService } from '@service/system/sys1000.service';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { Column } from '@shared/componentkit/table-edit/table-edit.model';
import { GalleriaModule } from 'primeng/galleria';
import { QueryTls43020Response } from '@service/api/tls/tls43020.service';
import { Tls43010Detail } from '@service/api/tls/tls43010.service';
import { environment } from 'src/environments/environment';
import { ImageQueryRequest, ImageService } from '@service/utility/image.service';
import { finalize, forkJoin } from 'rxjs';
interface MediaItem {
  url: string;
  type: 'image' | 'video';
  name: string;
}
@Component({
  selector: 'app-tls43020-cru',
  templateUrl: './tls43020-cru.component.html',
  styleUrl: './tls43020-cru.component.scss',
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
export class TLS43020CRUComponent extends BasicCruPageComponent<QueryTls43020Response> implements OnInit {
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
  // 如果機台群組編號有值那其他要disable，反之亦然
  columns: Column[] = [
    { field: 'NOT_SeqNo', header: '通告序號' },
    { field: 'ECR_No', header: '收銀機號', format: (value) => this.ECR_NoOptions.find(item => item.No === value)?.label || value },
    { field: 'TLT_No', header: '專櫃編號', format: (value) => this.TLT_NoOptions.find(item => item.No === value)?.label || value },
    { field: 'ECR_Type', header: '機台類型', format: (value) => this.ECR_TypeOptions.find(item => item.SYS_Code === value)?.SYS_Name || value },
    { field: 'ECR_GrpNo', header: '機台群組編號', format: (value) => this.ECR_GrpNoOptions.find(item => item.No === value)?.label || value },
    { field: 'BUILDING_No', header: '館別', format: (value) => this.BUILDING_NoOptions.find(item => item.No === value)?.Name || value },
    { field: 'FLOOR_No', header: '樓層', format: (value) => this.FLOOR_NoOptions.find(item => item.No === value)?.Name || value },
    { field: 'Area_No', header: '區域', format: (value) => this.Area_NoOptions.find(item => item.No === value)?.Name || value },
  ];
  hiddenTable = true;
  mediaItems = signal<MediaItem[]>([]);
  visible = signal(false);
  ECR_TypeOptions = SystemOptionsService.getOptions('ECR_Type');
  ECR_NoOptions: { No: string, Name: string, label: string }[] = [];
  TLT_NoOptions: { No: string, Name: string, label: string }[] = [];
  ECR_GrpNoOptions: { No: string, Name: string, label: string }[] = [];
  BUILDING_NoOptions: { No: string, Name: string, label: string }[] = [];
  FLOOR_NoOptions: { No: string, Name: string, label: string }[] = [];
  Area_NoOptions: { No: string, Name: string, label: string }[] = [];
  // ----------------------------------------------------------------
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly imageService: ImageService
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS43020', this.dataForm);
    this.loadDropdownOptions();
    if (!this.isFormCreateable) {
      this.dataForm.get('NOT_DtlLimit')?.setValue(this.rowdata?.NOT_DtlLimit || '0');
      this.data = this.rowdata?.Details || [];
      this.queryImages();
    }
  }
  loadDropdownOptions() {
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
      this.ECR_NoOptions = results[0].Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
      this.TLT_NoOptions = results[1].Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
      this.ECR_GrpNoOptions = results[2].Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
      this.BUILDING_NoOptions = results[3].Data.map(item => ({ ...item, label: item.No + ' - ' + item.Name }));
      this.FLOOR_NoOptions = results[4].Data.map(item => ({ ...item, label: item.No + ' - ' + item.Name }));
      this.Area_NoOptions = results[5].Data.map(item => ({ ...item, label: item.No + ' - ' + item.Name }));
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
}

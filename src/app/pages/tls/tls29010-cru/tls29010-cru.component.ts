import { Tls29010DetailService } from './tls29010-detail.service';
// --Commonly used imports--
import { Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { TranslateModule } from '@ngx-translate/core';
//
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { NgFor, NgIf } from '@angular/common';
import { ButtonDynamicallydeleteComponent } from '../../../shared/componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { ButtonDynamicallyaddComponent } from '../../../shared/componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption,option } from '../../../shared/models/sys/sysb000.module';
import { Tls29010Service } from '../../../service/api/tls/tls29010.service';
import { ColumnDef, ExpandableEditTableComponent } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';

// TALPORDERM (主檔)
export interface TALPORDERM {
  id: number; // identity(1,1) not null
  mid: number; // DEFAULT 0 not null
  str_no: string; // 店部編號
  pod_no: string; // 活動申請編號YYYYMMDDSSS(活動起始日期+流水號)
  pod_type: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'; 
  // 活動類型:
  // 1=預售 (只有預售才下到 pos)
  // 2=滿千送百發行
  // 3=滿千送百兌回
  // 4=會員卡集點-銷售 (不用)
  // 5=會員卡集點-點數 (不用)
  // 6=全館消費滿額集點-銷售
  // 7=全館消費滿額集點-點數
  // 8=期間開放折扣

  org_id?: string | null; // 組織-部門(SYS3100)
  act_no?: string | null; // 活動編號(群組)
  pod_desc?: string | null; // 活動名稱
  pod_sdate: Date; // 活動起始日期
  pod_edate: Date; // 活動終止日期
  pod_busdate?: Date | null; // 活動正檔日期
  cap_item?: string | null; // 扣款代碼
  pod_status: '0' | '1' | '9'; 
  // 0=未核准 1=已核准 9=刪除

  approved_userno?: string | null; // 核准人員
  approved_usr_name?: string | null; // 核准人員姓名
  approved_date?: Date | null; // 核准日期

  CRT_Date: string; // 建立日期 (ISO 字串格式: YYYY-MM-DD)
  CRT_USR_No: string; // 建立人員代碼
  CRT_USR_Name: string; // 建立人員姓名
  UPD_Date: string; // 變更日期 (ISO 格式: YYYY-MM-DDTHH:mm:ss)
  UPD_USR_No: string; // 變更人員代碼
  UPD_USR_Name: string; // 變更人員姓名
}

// TALPORDERD_OPENDisc (明細檔)
export interface TALPORDERD_OPENDisc {
  id: number; // 主鍵，自動編號
  mid: number; // 主鍵，自動編號

  str_no: string; // 店部編號
  pod_no: string; // 活動編號(TALPORDERM)
  talent_id: number; // 合約編號系統
  tlt_id: string; // 抽成類別(0-9)

  tlt_no: string; // 專櫃編號
  cag_barcode: string; // 折數(條碼)
  use_flag: string; // 是否使用 Y/N

  CRT_Date: string; // 建立日期 (ISO 字串格式: YYYY-MM-DD)
  CRT_USR_No: string; // 建立人員代碼
  CRT_USR_Name: string; // 建立人員姓名
  UPD_Date: string; // 變更日期 (ISO 格式: YYYY-MM-DDTHH:mm:ss)
  UPD_USR_No: string; // 變更人員代碼
  UPD_USR_Name: string; // 變更人員姓名

  status: string; // 狀態 (原始: 'orginal', 新增: 'new', 編輯: 'modified', 刪除: 'deleted')
}

@Component({
  selector: 'app-tls29010-cru',
  templateUrl: './tls29010-cru.component.html',
  styleUrl: './tls29010-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, ExpandableEditTableComponent, CalendarComponent, DropdownComponent, RadiobuttonComponent, EditorTextComponent, InputTextComponent, InputNumberComponent, EditorTextComponent, NgFor, ButtonDynamicallydeleteComponent, ButtonDynamicallyaddComponent, ButtonComponent, NgIf, TranslateModule]
})

// 2.2.9.1 折扣開放維護作業cru
export class TLS29010CRUComponent extends BasicCruPageComponent<TALPORDERD_OPENDisc> implements OnInit{
  @ViewChild('detailTable') detailTable!: ExpandableEditTableComponent;
  // ----------------------------------------------------------------
      dataForm = this.formBuilder.nonNullable.group({
        // --專櫃活動設定主檔TALPORDERM (新增這四項 都要鎖定嗎)--
        id: [{ value: null, disabled: true }], // 自動產生，不允許編輯
        mid: [{ value: null, disabled: true }], // 自動產生，不允許編輯
        str_no: ['', [Validators.required, Validators.maxLength(8)]],   // 店部編號
        pod_no: ['', [Validators.required, Validators.maxLength(12)]],  // 活動申請編號YYYYMMDDSSS(活動起始日期+流水號)

        pod_type: ['', [Validators.required, Validators.maxLength(1)]], // 活動類型 //這邊只會有8的 /*8=期間開放折扣
        // ------
        talent_id: [null],                              // 合約編號系統 -- 這是哪來的
        tlt_id: [0, [Validators.required, Validators.maxLength(1), Validators.min(0),Validators.max(9)]], // 抽成類別(0-9) 送出時再轉成string
        tlt_no: ['', [Validators.required, Validators.maxLength(8)]],        // 專櫃編號(是從TLTTALENT取吧)
        cag_barcode: ['', [Validators.required, Validators.maxLength(13)]],  // 折數條碼 (條碼)
        use_flag: ['', [Validators.required, Validators.maxLength(1)]],      // 是否使用 Y/N
      });
    
      whetherOption: option[] = [ // 是否使用 Y/N
        {value: 'Y', label: '是'},
        {value: 'N', label: '否'}
      ];

      tlt_No_Option: apiOption[] = [];  // 專櫃編號下拉

      // ---Potential_Customer_Detail 潛在客戶其他資料明細檔---
      potentialDetail: TALPORDERD_OPENDisc[] = [];
      //欄位資訊
      Potential_Customer_Detail_Columns: ColumnDef[] = [
        { field: 'tlt_id', header: '折扣別', type: 'text', editable: true, autoWidth: true },
        { field: 'pod_sdate', header: '合約起始日', type: 'date', editable: true, autoWidth: true },
        { field: 'pod_edate', header: '合約終止日', type: 'date', editable: true, autoWidth: true },
        { field: 'cag_barcode', header: '抽成率', type: 'number', allowDecimal: true, decimalPlaces: 3, editable: true, autoWidth: true },
      ];
      // 預設新項目模板
      defaultNewDetail: { tlt_id: string; pod_sdate: Date | null; pod_edate: Date | null; cag_barcode: number; status: string } = {
        tlt_id: '', // 折扣別
        pod_sdate: null, // 合約起始日
        pod_edate: null, // 合約終止日
        cag_barcode: 0, // 折數條碼
      
        status: 'new' // 新增狀態
      };
      // 預設 POS2005 新項目模板
      createDefaultNew(tlt_id: string) {
        this.defaultNewDetail = {
          tlt_id: tlt_id, // 折扣別
          pod_sdate: null, // 合約起始日
          pod_edate: null, // 合約終止日
          cag_barcode: 0, // 折數條碼
      
          status: 'new' // 新增狀態
        };
      }
      // 展開式表格的載入狀態
      expandDetailLoading = false;
      // ------

      // ----------------------------------------------------------------
      constructor(
        private tls12010Service: Tls29010Service,
        private tls29010DetailService: Tls29010DetailService,
      ) {
        super(); // 呼叫父類建構子
      }
    
      ngOnInit(): void {
        this.initializePage('TLS29010', this.dataForm);
        this.loadOption();
        console.log('讀取資料', this.dataForm.value);
      }
    
      onSubmit(frm: FormGroup) {
        this.messageService.blockUi();
        this.submitted = true;
    
        if (this.dataForm.invalid) {
          this.messageService.unblockUi();
          return;
        }
    
        const formValue = frm.getRawValue();
        switch (this.crudstatus) {
          case CRUDStatus.Create:
            if (this.canAdd()) {
              console.log('insert', frm.value);
              // this.tls51080Service.insertTLS51080(formValue).subscribe(() => {
              //   this.messageService.successBubble('新增成功');
              //   // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
              //   this.dataForm.reset(); // 重置表單
              // });
            }
            break;
          case CRUDStatus.Edit:
            if (this.canEdit()) {
              console.log('update', formValue);
              // this.tls51080Service.updateTLS51080(formValue).subscribe(() => {
              //   // this.messageService.successBubble('更新成功');
              //   this.onCancel(); // 儲存後，會返回列表
              // });
            }
            break;
        }
    
        this.messageService.unblockUi();
        this.submitted = false;
      }
    
      submitForm(frm: FormGroup) {
        this.onSubmit(frm);
      }
    
      onClearForm() {
        this.dataForm.reset(); // 重置表單
      }

      loadOption(){
        // 專櫃編號
        this.tls12010Service
          .queryTLTTALENT_Status_DropDownList({})
          .subscribe((response) => {
            this.tlt_No_Option = response.Data.map((item: apiOption) => ({
              No: item.No,
              Name: item.Name,
              Label: item.No + '-' + item.Name,
            }));
      
            console.log('專櫃編號 下拉:', response.Data);
          });
      }

    // ---明細檔操作---
    //HTML 顯示的明細資料
    get filteredDetail(): TALPORDERD_OPENDisc[] {
      return this.potentialDetail.filter(item => item.status !== 'deleted');
    }
    
    //---Potential_Customer_Detail 表格編輯事件---
    onRowSaveDetail(event: any) {
      this.tls29010DetailService.handleRowSave(event);
    }

    onRowCancelDetail(event: any) {
      this.tls29010DetailService.handleRowCancel(event);
    }
    // 新增 Potential_Customer_Detail
    onAddPotentialCustomerDetail() {
      this.tls29010DetailService.addPotentialCustomerDetail(this.potentialDetail, this.defaultNewDetail, this.detailTable);
    }
    // 批次刪除  Potential_Customer_Detail
    onBatchDeleteDetail(selectedItems: TALPORDERD_OPENDisc[]): void {
      this.tls29010DetailService.deletePotentialCustomerDetail(selectedItems, this.potentialDetail);
    }            
}

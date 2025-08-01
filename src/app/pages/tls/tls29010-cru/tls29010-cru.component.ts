import { Tls29010DetailService } from './tls29010-detail.service';
// --Commonly used imports--
import { Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
  id: string; // identity(1,1) not null
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

  org_id?: string | null; // 組織-部門(SYS3100) //
  act_no?: string | null; // 活動編號(群組) //
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
  //主黨也可以新增
  // ----------------------------------------------------------------
      dataForm = this.formBuilder.group({
        id: [{value: null, disabled: true}], // 主鍵，自動編號
        mid: [{value: null, disabled: true}], // 主檔關聯 ID
        str_no: [{value: '', disabled: true}], // 店部編號
        // --先選 專櫃活動設定主檔TALPORDERM--
        //欄位用這些就好
        pod_no: [{value: null, disabled: true}], // 活動申請編號 (YYYYMMDDSSS)
        pod_type: ['', Validators.required], // 活動類型(1=預售, 2=滿千送百發行, 3=滿千送百兌回, 4~5=會員卡集點, 6~7=全館集點, 8=期間開放折扣)
        pod_desc: ['',[Validators.required, Validators.maxLength(100)]], // 活動名稱(新增時開放下拉選取) 抓 [TALPORDERD]
        pod_sdate: [{value: null, disabled: true}], // 活動起始日 (Date)
        pod_edate: [{value: null, disabled: true}], // 活動終止日 (Date)

        org_id: [''], // 組織-部門(SYS3100)
        act_no: [''], // 活動編號(群組)
        pod_busdate: [{value: null, disabled: true}], // 活動正檔日期
        cap_item: [''], // 扣款代碼
        pod_status: ['', Validators.required], // 活動狀態(0=未核准, 1=已核准, 9=刪除)

        // 核准不會再新增進行，先鎖起來
        approved_userno: [{value: null, disabled: true}], // 核准人員編號
        approved_usr_name: [{value: null, disabled: true}], // 核准人員姓名
        approved_date: [{value: null, disabled: true}], // 核准日期
      });
    
      whetherOption: option[] = [ // 是否使用 Y/N
        {value: 'Y', label: '是'},
        {value: 'N', label: '否'}
      ];

      podTypeOptions = [
        { label: '1 預售', value: '1' },
        { label: '2 滿千送百(發行)', value: '2' },
        { label: '3 滿千送百(兌回)', value: '3' },
        { label: '4 會員卡集點-銷售', value: '4' },
        { label: '5 會員卡集點-點數', value: '5' },
        { label: '6 全館集點-銷售', value: '6' },
        { label: '7 全館集點-點數', value: '7' },
        { label: '8 期間開放折扣', value: '8' }, //新增用這個
      ];

      pod_status_Options = [
        { label: '未核准', value: '0' },
        { label: '已核准', value: '1' },
        { label: '刪除', value: '9' },
      ];

      mockDetailDataOptions = [
        {
          value: '1',
          label: 'A001_新光三越信義A11', // 專櫃名稱（專櫃編號_專櫃名稱）
        },
        {
          value: '2',
          label: 'B002_統一時代百貨台北店',
        },
        {
          value: '3',
          label: 'C003_台中大遠百',
        }
      ];

      //測試用的主檔表單 (如果是編輯模式就只有一筆)
      activityList: any = [
        {
          pod_no: '20250724001',
          pod_desc: '測試活動A',
          pod_sdate: new Date('2025-07-24'),
          pod_edate: new Date('2025-08-24'),
        },
        {
          pod_no: '20250724002',
          pod_desc: '夏日特賣會',
          pod_sdate: new Date('2025-08-01'),
          pod_edate: new Date('2025-08-31'),
        }
      ];

      // 有8 不能重複
      actNoOptions: apiOption[] = []; // 活動群組編號下拉選單 -- 僅顯示(依照id, mid自動切換)
      tlt_No_Option: apiOption[] = [];  // 專櫃編號下拉
      orgOptions: apiOption[] = []; // 組織部門下拉選單

      //主檔下拉 --之後由後端api提供

      // ---Potential_Customer_Detail 潛在客戶其他資料明細檔 table---
      potentialDetail: TALPORDERD_OPENDisc[] = [];
      //欄位資訊
      Potential_Customer_Detail_Columns: ColumnDef[] = [
        // { field: 'id', header: '主鍵', type: 'number', editable: false, autoWidth: false },
        // { field: 'mid', header: '主鍵', type: 'number', editable: false, autoWidth: false },
        // { field: 'str_no', header: '店部編號', type: 'text', editable: true, autoWidth: false },
        // { field: 'pod_no', header: '活動編號', type: 'text', editable: true, autoWidth: false },  //活動編號(TALPORDERM)

        { field: 'talent_id', header: '合約編號系統', type: 'number', editable: false, autoWidth: true, hidden:true }, // 不用顯示 內容與主檔案一致 *
        { field: 'tlt_id', header: '抽成類別', type: 'text', editable: true, autoWidth: true }, // 抽成類別(0-9) *
        //---要使用的---
        // [專櫃編號] 帶出 下面這坨
        { field: 'tlt_no', header: '專櫃名稱', type: 'dropdown', editable: true, autoWidth: true, options: this.mockDetailDataOptions}, //(專櫃編號_專櫃名稱，下拉選單)用[專櫃編號] 帶出 [專櫃名稱]、[抽成類別]、[折數]、[抽成率] * ([TALPORDERD])
        { field: 'cag_barcode', header: '折數', type: 'text', editable: true, autoWidth: true }, // 後端提供，要去(TLTTALENT_CHARGED)撈 *
        { field: 'cag_charge_rate', header: '抽成率', type: 'text', editable: true, autoWidth: true }, // 後端提供，要去(TLTTALENT_CHARGED)撈 * (*為一組，用id,mid 對應)
        { field: 'use_flag', header: '是否使用', type: 'dropdown', editable: true, autoWidth: true, options: this.whetherOption }, // 本作業維護
      ];
      // 預設新項目模板
      defaultNewDetail: any = {
        talent_id: '', // 合約編號系統
        tlt_id: '', // 折扣別
        // --SA指定的顯示項目--
        tlt_no: '', // 抽成類別
        cag_barcode: 0, // 折數條碼 //依照專櫃編號 進行變動
        cag_charge_rate: 0, // 折數條碼 //依照專櫃編號 進行變動
        use_flag: 'Y', // 是否使用

        status: 'new' // 新增狀態
      };
      // 預設 POS2005 新項目模板 (內容有需要變動時使用)
      // createDefaultNew() {
      //   this.defaultNewDetail = {
      //     talent_id: '', // 合約編號系統
      //     tlt_id: '', // 抽成類別(0-9)
      //     tlt_no: '', // 抽成類別
      //     cag_barcode: '', // 折數條碼 //依照專櫃編號 進行變動
      //     cag_charge_rate: '', // 折數條碼 //依照專櫃編號 進行變動
      //     use_flag: true, // 是否使用: 
      
      //     status: 'new' // 新增狀態
      //   };
      // }
      // 展開式表格的載入狀態
      expandDetailLoading = false;
      // ------

      // ----------------------------------------------------------------
      constructor(
        private tls29010Service: Tls29010Service,
        private tls29010DetailService: Tls29010DetailService,
      ) {
        super(); // 呼叫父類建構子
      }
    
      ngOnInit(): void {
        this.initializePage('TLS29010', this.dataForm);
        this.loadOption();
        console.log('讀取資料', this.dataForm.value);
        
        //新增模式pod_desc才可以填寫，否則與其他欄位一樣都設為disabled
        if(this.crudstatus === CRUDStatus.Create) {
          this.dataForm.get('pod_desc')?.enable();
          const userInfo = this.authService?.getUserInfo?.();
          this.dataForm.get('str_no')?.setValue(userInfo?.SYS_StoreNo || '') //依照section填寫店號

          this.dataForm.get('pod_status')?.setValue('0') //新增模式 [活動狀態] 只能(未審核)
          this.dataForm.get('pod_status')?.disable();
        } else {
          this.dataForm.get('pod_desc')?.disable();
        }
      }
    
      //---新增卡控(tlt_id =8 只能有一筆)---
      onSubmit(frm: FormGroup) {
        this.messageService.blockUi();
        this.submitted = true;

        if (this.dataForm.invalid) {
          this.messageService.unblockUi();
          return;
        }

         //將新的資料ID指定為null
        const processedDetail = this.potentialDetail.map(item => {
          // 刪除 key 為空字串的欄位
          if ("" in item) {
            delete item[""];
          }

          if (item.status === 'new') {
            return { ...item, id: null}; // 把新項目的 ID, PC_id 改為 null
          }
          return item; // 其他不變
        });
    
        const formValue = frm.getRawValue();
        const body = {
          ...formValue,
          Detail: processedDetail, // 將明細資料加入請求體
        }
    
        switch (this.crudstatus) {
          case CRUDStatus.Create:
            if (this.canAdd()) {
              console.log('insert', body);
              // this.tls51080Service.insertTLS51080(formValue).subscribe(() => {
              //   this.messageService.successBubble('新增成功');
              //   // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
              //   this.dataForm.reset(); // 重置表單
              // });
            }
            break;
          case CRUDStatus.Edit:
            if (this.canEdit()) {
              console.log('update', body);
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
        this.tls29010Service
          .queryTLTTALENT_Status_DropDownList({})
          .subscribe((response) => {
            this.tlt_No_Option = response.Data.map((item: apiOption) => ({
              No: item.No,
              Name: item.Name,
              Label: item.No + '-' + item.Name,
            }));
      
            console.log('專櫃編號 下拉:', response.Data);
          });
        // 部門編號(SYS3100)
        this.tls29010Service
          .querySYS3100_DropDownList({})
          .subscribe((response) => {
            this.orgOptions = response.Data.map((item: apiOption) => ({
              No: item.No,
              Name: item.Name,
              Label: item.No + '-' + item.Name,
            }));
      
            console.log('部門編號 下拉:', response.Data);
          });
      }

    // ---主檔點選後的變更(僅顯新增模式)---
    // ---修改模式只會該筆主檔的，且不可編輯---
    onPodDescChange(desc: string): void {
      if(this.crudstatus === CRUDStatus.Create){
        const selectedActivity = this.activityList.find((act: { pod_desc: string; }) => act.pod_desc === desc);
        console.log('主檔名稱',selectedActivity);

        if (selectedActivity) {
          this.dataForm.patchValue({
            pod_no: selectedActivity.pod_no,
            pod_desc: selectedActivity.pod_desc,
            pod_sdate: selectedActivity.pod_sdate,
            pod_edate: selectedActivity.pod_edate,
          });

          //依據選擇內容更新明細模板的日期
          // this.createDefaultNew('');
        }
      }
    }

    // ---明細檔操作---
    //HTML 顯示的明細資料
    get filteredDetail(): TALPORDERD_OPENDisc[] {
      return this.potentialDetail.filter(item => item.status !== 'deleted');
    }
    
    //---TALPORDERD_OPENDisc 表格編輯事件---
    onRowSaveDetail(event: any) {
      this.tls29010DetailService.handleRowSave(event);
    }

    onRowCancelDetail(event: any) {
      this.tls29010DetailService.handleRowCancel(event);
    }
    // 新增 TALPORDERD_OPENDisc
    onAddPotentialCustomerDetail() {
      this.tls29010DetailService.addPotentialCustomerDetail(this.potentialDetail, this.defaultNewDetail, this.detailTable);
    }
    // 批次刪除 TALPORDERD_OPENDisc
    onBatchDeleteDetail(selectedItems: TALPORDERD_OPENDisc[]): void {
      this.tls29010DetailService.deletePotentialCustomerDetail(selectedItems, this.potentialDetail);
    }            
}

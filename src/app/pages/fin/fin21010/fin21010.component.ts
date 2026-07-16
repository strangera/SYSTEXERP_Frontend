import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { APS1002, FIN21010Response, Fin21010Service } from '@service/api/fin/fin21010.service';
import { getSYS1000 } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '@others/component/table/table.model';
import { apiOption } from '@shared/models/sys/sysb000.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { TableComponent } from '../../../others/component/table/table.component';

//1.2.1.1 公司銀行資料維護
@Component({
  selector: 'app-fin21010',
  templateUrl: './fin21010.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, InputTextComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent,
    // MultiSelectComponent,
    InputTextComponent, TableComponent, TranslateModule]
})
export class FIN21010Component extends BasicQueryPageComponent<APS1002> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    //APS1002  公司銀行資料維護主檔
    BNK_DepositAccNo: [null], // 公司銀行科目 //"下拉 GLS1005.ACCNO 讀取 ACCNO, ACCCNAME" (accNo like '1103%')
    AccCName: [null],         // 公司銀行科目名稱(文字輸入)

    BNK_No: [null],           // 全省銀行代碼 // "讀取APS1004銀行分行代碼檔
    // 下拉BNK_NO+BNK_BRANCHNO銀行代碼、銀行名稱BNK_BRANCHNAME
    // 不可重覆"
    BNK_AccNo: [null],        // 帳號
    BNK_AccName1: [null],     // 帳戶名稱
    BNK_AccType: [null],      // 存款代號 (SYS1000.BNK_ACCTYPE)

    SYS_Name: [null],     // EDI用戶代號(統一編號)

    // BNK_BranchNo: [null],     // 銀行分行代號
    // BNK_AccStatus: ['0'],     // 帳戶狀態 (0=正常)

    BNK_CheckInAccNo: [null],                       // 應收票據科目 //"下拉 GLS1005.ACCNO 讀取 ACCNO, ACCCNAME" (ClassNo 211 0r 212)
    BNK_CheckOutAccNo: [null],                      // 應付票據科目 //"下拉 GLS1005.ACCNO 讀取 ACCNO, ACCCNAME" (ClassNo 112 or 113)
    //分頁查詢
    ...createPaginationConfig([{ field: 'BNK_No', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  APS1004_Option: apiOption[] = []; // APS1004銀行分行代碼檔 -- 下拉BNK_NO+BNK_BRANCHNO銀行代碼、銀行名稱BNK_BRANCHNAME， 不可重覆

  // -----------看要不要由GLS1005_Option去mapping---------------------
  GLS1005_BNK_DepositAccNo_Option: apiOption[] = []; // 公司銀行科目  (accNo like '1103%')
  GLS1005_BNK_CheckInAccNo_Option: apiOption[] = []; // 應收票據科目 (ClassNo 112 or 113)
  GLS1005_BNK_CheckOutAccNo_Option: apiOption[] = []; // 應付票據科目  (ClassNo 211 0r 212)
  // ----------------------------------------------------------------

  BNK_AccType_Option: apiOption[] = []; // SYS1000.BNK_ACCTYPE 存款代號 -- 下拉選單

  data: FIN21010Response[] = [];
  columns: Column[] = [
    {
      field: 'BNK_DepositAccNo',
      header: '公司銀行科目',
      visible: true,
    },
    { field: 'AccCName', header: '公司銀行科目中文名稱', visible: true },
    { field: 'BNK_No', header: '銀行代碼', visible: true },
    { field: 'Bank_Name', header: '銀行名稱', visible: true },
    { field: 'BNK_AccNo', header: '帳號', visible: true },
    { field: 'BNK_AccName1', header: '帳戶名稱', visible: true },
    {
      field: 'BNK_AccType', header: '存款代號', visible: true,
      format: (value: string) => getSYS1000('BNK_AccType', value)
    },
    {
      field: 'BNK_CheckInAccNo',
      header: '應收票據科目',
      visible: true,
    },
    {
      field: 'BNK_CheckInAccCName',
      header: '應收票據名稱',
      visible: true,
    },
    {
      field: 'BNK_CheckOutAccNo',
      header: '應付票據科目',
      visible: true,
    },
    {
      field: 'BNK_CheckOutAccCName',
      header: '應付票據名稱',
      visible: true,
    }
  ];

  selectedItems: APS1002[] = [];// 多選項目
  // ----------------------------------------------------------------
  constructor(
    private fin21010Service: Fin21010Service,
    private dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN21010', 'FIN/FIN21010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin21010Service.queryFIN21010(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((response) => {
        this.data = response.Data || [];
        this.totalRecords = response.TotalCount || response.Data.length;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  // 刪除項目
  onDelete(data: APS1002 | APS1002[]): void {
    this.messageService.confirm({
      message: `是否確認刪除選中的公司銀行資料?`,
      header: `確認刪除`,
      accept: () => {
        const items = Array.isArray(data) ? data : [data];
        if (items.length === 0) {
          console.error('No items to delete');
          this.messageService.errorBubble('無法刪除：沒有選中的項目');
          return;
        }

        // 收集所有有效的 ID
        const idList = items
          .filter((item) => item && item.id != null && item.id !== undefined)
          .map((item) => item.id);

        if (idList.length === 0) {
          console.error('No valid IDs to delete');
          this.messageService.errorBubble('無法刪除：選中的項目缺少有效 ID');
          return;
        }

        const deleteBody = {
          idList: idList, // 符合 API 的 idList 格式
        };
        console.log('deleteBody', deleteBody);

        this.fin21010Service.deleteFIN21010(deleteBody).subscribe({
          next: (response) => {
            if (response.Status === '0000') {
              this.messageService.successBubble('選中項目刪除成功');
            } else {
              console.error('API error:', response.Status, response.Message);
              this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
            }
          },
          error: (err: string) => {
            console.error('API error:', err);
            this.messageService.errorBubble('刪除失敗');
          },
          complete: () => {
            this.onSubmit(this.queryForm);
          },
        });

        this.selectedItems = [];
      },
    });
  }

  isRowSelectable(rowData: APS1002): boolean {
    // return rowData.CanDel ?? false;
    //刪除不卡控
    return true;
  }

  loadOptions() {
    // 查 SYS1000.BNK_ACCTYPE 存款代號 -- 下拉選單
    this.dropdownApiService.querySys1000({ "SYS_Type": "BNK_ACCTYPE" }).pipe(untilDestroyed(this)).subscribe((response) => {
      const list = Array.isArray(response) ? response : [];
      this.BNK_AccType_Option = list.map((item: any) => ({
        No: item.No, // 存款代號 代號
        Name: item.Name, // 存款代號 名稱

      }));
      console.log('SYS1000.BNK_ACCTYPE 存款代號:', this.BNK_AccType_Option);
    });

    // 查 公司銀行科目代號(/queryAPS1002_DropDownList)
    this.dropdownApiService.queryAps1002().pipe(untilDestroyed(this)).subscribe((response) => {
      const list = Array.isArray(response) ? response : [];
      this.GLS1005_BNK_DepositAccNo_Option = list.map((item: any) => ({
        No: item.BNK_DepositAccNo, // 公司銀行科目 代號
        Name: item.ACCCNAME, // 公司銀行科目 名稱
        Label: item.BNK_DepositAccNo + '-' + item.ACCCNAME, // 代碼+名稱
      }));
      console.log('公司銀行科目代號:', this.GLS1005_BNK_DepositAccNo_Option);
    });


    this.dropdownApiService.queryGls1005_BNK_CheckInAcc().pipe(untilDestroyed(this)).subscribe((response) => {
      const list = Array.isArray(response) ? response : [];
      this.GLS1005_BNK_CheckOutAccNo_Option = list.map((item: any) => ({
        No: item.No, // 應付票據科目 代號
        Name: item.Name, // 應付票據科目 名稱
        Label: item.No + '-' + item.Name, // 代碼+名稱
      }));
      console.log('應付票據科目:', this.GLS1005_BNK_CheckOutAccNo_Option);

    });

    this.dropdownApiService.queryGls1005_BNK_CheckOutAcc().pipe(untilDestroyed(this)).subscribe((response) => {
      const list = Array.isArray(response) ? response : [];
      this.GLS1005_BNK_CheckInAccNo_Option = list.map((item: any) => ({
        No: item.No, // 應收票據科目 代號
        Name: item.Name, // 應收票據科目 名稱
        Label: item.No + '-' + item.Name, // 代碼+名稱
      }));
      console.log('應收票據科目:', this.GLS1005_BNK_CheckInAccNo_Option);
    });

    // 查 APS1004 -- 下拉選單(
    // No: BNK_NO+BNK_BRANCHNO銀行代碼、
    // Name: 銀行名稱BNK_BRANCHNAME
    // ) 範圍: 全找
    this.dropdownApiService.queryAps1001({ "SearchKeyword": "" }).pipe(untilDestroyed(this)).subscribe((response) => {
      const list = Array.isArray(response) ? response : [];
      this.APS1004_Option = list.map((item: any) => ({
        No: item.No, // 全省銀行 代碼
        Name: item.Name, // 全省銀行 名稱
        Label: item.No + '-' + item.Name, // 代號+名稱
      }));
      console.log('全省銀行代碼:', this.APS1004_Option);
    });
  }
}

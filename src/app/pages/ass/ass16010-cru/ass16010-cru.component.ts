import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS16010Data, ASS16010Service, InsertASS16010Request, QueryASS11020Request, QueryASS11100Request, QueryASS16010DetailResponse } from '@service/api/ass/ass16010.service';
import { NotificationService } from '@shared/components/notification-message/notification.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { formatDate } from '@others/component/table/table.model';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';

@Component({
  selector: 'app-ass16010-cru',
  templateUrl: './ass16010-cru.component.html',
  styleUrl: './ass16010-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, DropdownComponent, RadiobuttonComponent, ButtonComponent, TranslateModule, TableModule]
})
export class ASS16010CRUComponent extends BasicCruPageComponent<ASS16010Data> implements OnInit {

  // 盤點單明細（僅「查看」模式使用）
  detailData = signal<QueryASS16010DetailResponse[]>([]);

  // 給 template 用：INV_DATE 格式化（跟查詢頁 columns 的 formatDate 一致）
  readonly formatDate = formatDate;

  ngOnInit(): void {
    // 初始化
    this.initializePage('ASS16010', this.dataForm);

    if (this.crudstatus === CRUDStatus.Read) {
      this.loadInventoryDetail();
      return;
    }

    this.loadDropdownOptions();

    // 先初始值跑一次
    this.updateDynamicValidators(this.dataForm.controls.invType.value ?? 0);

    // 之後每次 invType 改變都會再跑
    this.dataForm.controls.invType.valueChanges.subscribe(value => {
      this.updateDynamicValidators(value ?? 0);
    });
  }

  private loadInventoryDetail(): void {
    const invId = this.rowdata?.INV_ID;
    if (!invId) {
      this.notification.warnBubble('缺少盤點單號，無法載入明細資料。');
      return;
    }

    this.loading = true;
    this.ass16010Service.queryASS16010Detail({ INV_ID: invId })
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.detailData.set(res.Data ?? []);
        },
      });
  }

  //非動態新增 ----------------------------------------------------------
  dataForm = this.formBuilder.group({
    whCategory: ['', Validators.required],
    invType: [0],
    categoryOptions: [''],
  });


  // 根據表單值組裝要送後端的 payload
  private buildASS16010LikePayload(): InsertASS16010Request {
    const raw = this.dataForm.getRawValue();
    const categoryParts = raw.categoryOptions?.split(' - ') ?? [];

    return {
      STO_NO: this.getUserInfoFromLocal().SYS_StoreNo,
      INV_TYPE: raw.invType?.toString() ?? '0',
      WHIDs: raw.whCategory ? [raw.whCategory] : [],
      B_CLASS_ID: categoryParts[0] ?? '',
      M_CLASS_ID: categoryParts[1] ?? '',
      CRT_USR_No: this.getUserInfoFromLocal().user_No,
      CRT_USR_Name: this.getUserInfoFromLocal().user_Name,
    };
  }

  // Dropdown options
  whCategory = signal<{ label: string; value: string }[]>([]);
  invType = [
    { value: 1, label: '全盤(不分類)' },
    { value: 2, label: '部份盤(以中分類)' },
  ];
  categoryOptions = signal<{ label: string; value: string }[]>([]);

  // ----------------------------------------------------------------
  constructor(
    private ass16010Service: ASS16010Service,
    private readonly notification: NotificationService
  ) {
    super(); // 呼叫父類建構子
  }

  // ----------------------------------------------------------------

  onSubmit() {
    this.handleSubmit(this.dataForm, () => {
      if (this.isFormCreateable) {
        const payload = this.buildASS16010LikePayload();
        this.ass16010Service.insertASS16010(payload)
          .pipe(
            finalize(() => {
              this.loading = false;
            })
          )
          .subscribe({
            next: res => {
              if (res.Status !== '0000') return;

              // SP 端會逐倉別檢查：所選分類在該倉別完全無庫存時會直接跳過、不建立盤點單，
              // 但仍回傳成功狀態，Data 會是空陣列 → 必須用這個判斷才知道有沒有真的產生任何盤點單
              if (!res.Data || res.Data.length === 0) {
                this.notification.warnBubble('所選倉別在此分類下皆無庫存資料，未建立任何盤點單');
                return;
              }

              this.notification.successBubble('新增成功');
              this.onCancel();
            },
            error: err => {
              console.error(err);
            }
          });
        return;
      }

    });
  }


  // 根據盤點類型動態更新驗證規則
  private updateDynamicValidators(value: number): void {
    const { categoryOptions } = this.dataForm.controls;

    categoryOptions.clearValidators();

    if (value === 2) {
      categoryOptions.setValidators([Validators.required]);
    }

    categoryOptions.updateValueAndValidity();
  }

  // ----------------------------------------------------------------

  /**
   * 載入下拉選單選項
   */
  private loadDropdownOptions(): void {
    // 倉別
    const ASS11100_req: QueryASS11100Request = { STO_NO: this.getUserInfoFromLocal().SYS_StoreNo };
    this.ass16010Service.queryASS11100(ASS11100_req).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = (res.Data.QueryData ?? []).map(item => ({
          label: `${item.WH_ID} - ${item.WH_NAME}`,
          value: item.WH_ID,
        }));
        this.whCategory.set(options);
      },
    });

    const ASS11020_req: QueryASS11020Request = { STO_NO: this.getUserInfoFromLocal().SYS_StoreNo };
    this.ass16010Service.queryASS11020(ASS11020_req).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = (res.Data.QueryData ?? []).map(item => ({
          label: `${item.M_CLASS_ID} - ${item.M_CLASS_NAME}`,
          value: `${item.B_CLASS_ID} - ${item.M_CLASS_ID}`,
        }));
        this.categoryOptions.set(options);
      },
    });

  }

  /** 解析 localStorage.UserInfo，回傳 { mid, SYS_StoreNo, user_No, user_Name } */
  private getUserInfoFromLocal(): { mid: number; SYS_StoreNo: string; user_No: string; user_Name: string } {
    let mid = 0;
    let SYS_StoreNo = '';
    let user_No = '';
    let user_Name = '';

    try {
      const raw = localStorage.getItem('UserInfo');
      if (raw) {
        const obj = JSON.parse(raw);
        // 依你的截圖欄位：mid 與 SYS_StoreNo
        mid = Number(obj?.mid ?? 0);
        SYS_StoreNo = String(obj?.SYS_StoreNo ?? '');
        user_No = String(obj?.user_No ?? '');
        user_Name = String(obj?.user_Name ?? '');
      }
    } catch (e) {
      console.error('解析 localStorage.UserInfo 失敗：', e);
    }

    return { mid, SYS_StoreNo, user_No, user_Name };
  }
}


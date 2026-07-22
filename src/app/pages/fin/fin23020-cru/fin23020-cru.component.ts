import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DetailFIN23020Line, Fin23020Service, PostingFIN23020Request, QueryFIN23020Response } from '@service/api/fin/fin23020.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { formatAmount } from '@shared/components/table-report/table-report.model';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin } from 'rxjs';
import { CalendarComponent } from 'src/app/shared/components/calendar/calendar.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

/** 查詢頁勾選多筆後帶進本頁的最小資料 */
interface Fin23020CruState {
  items: QueryFIN23020Response[];
  /** 查詢頁選的傳票日期，套用到這批全部拋轉的傳票，對應 SP_FIN23020Posting 新增的 @VouDate 參數 */
  VouDate?: string | null;
}

/** 攤平後的傳票明細列，額外帶原始來源 id/預支單號/借貸方向，方便按來源重組拋轉請求 */
interface PostingLine extends DetailFIN23020Line {
  _sourceId: number;
  _prepNo: string;
  _isDebit: boolean;
}

/**
 * 1.2.3.2 暫付款申請傳票拋轉作業 - 拋轉預覽頁
 *
 * 查詢頁勾選多筆後按「預覽傳票」導進這頁，這頁對每一筆勾選的暫付款各自呼叫一次
 * SP_FIN23020Detail 取得預覽(借方暫付款/貸方應付帳款各一筆)，攤平成一張表讓使用者
 * 編輯摘要/貸方科目/組織代號/立沖代號，最後按「確定拋轉」才會對每一筆各自呼叫一次
 * SP_FIN23020Posting —— 一筆暫付款＝一張傳票，不會合併成一張(比照 SP 註解的既定規則)。
 */
@Component({
  selector: 'app-fin23020-cru',
  templateUrl: './fin23020-cru.component.html',
  standalone: true,
  imports: [CalendarComponent, MenubarComponent, PanelModule, ReactiveFormsModule, InputTextComponent, ButtonComponent, TableEditComponent, TranslateModule]
})
export class FIN23020CRUComponent extends BasicCruPageComponent<Fin23020CruState> implements OnInit {
  private readonly fin23020Service = inject(Fin23020Service);
  private readonly dropdown = inject(DropdownApiService);

  dataForm = this.formBuilder.group({
    VouNo: [{ value: null as string | null, disabled: true }],        // 傳票編號(自動產生)
    VouTypeName: [{ value: null as string | null, disabled: true }],  // 傳票種類
    VouForm: [{ value: null as string | null, disabled: true }],      // 傳票型態
    VouDate: [{ value: null as string | null, disabled: true }],      // 傳票日期(系統當下日期，SP目前無法自訂)
    VouSummary: [null as string | null],                               // 傳票摘要(可編輯，套用到本次全部拋轉的傳票)
    CRT_USR_No: [{ value: null as string | null, disabled: true }],
    CRT_USR_Name: [{ value: null as string | null, disabled: true }],
    CRT_Date: [{ value: null as string | null, disabled: true }],
  });

  data: PostingLine[] = [];
  initTable = false;

  private readonly ledgerOptions$ = this.dropdown.queryGls1005_ledgerMD();
  private readonly orgOptions$ = this.dropdown.querySys3100();

  columns: EditColumn[] = [
    { field: 'SeqNo', header: '序號', width: '60px', textAlign: 'center', disabled: () => true },
    {
      field: 'AcctCode', header: '科目代號', width: '120px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.ledgerOptions$, optionLabel: 'value', optionValue: 'value',
      templateLabel: 'label', showClear: false,
      disabled: (_v, _i, rowData: PostingLine) => rowData._isDebit, // 借方科目固定(暫付款費用)，不可改；貸方科目才可選
      onChange: (rowData: PostingLine, value: string) => {
        if (value) {
          this.dropdown.queryGls1005_ledgerMD().subscribe(options => {
            const selected = options?.find(opt => opt.value === value);
            if (selected) {
              rowData.AcctName = (selected as unknown as { Name: string }).Name;
            }
          });
        } else {
          rowData.AcctName = '';
        }
      }
    },
    { field: 'AcctName', header: '科目名稱', width: '160px', textAlign: 'left', disabled: () => true },
    { field: 'VenNo', header: '廠商代號', width: '110px', textAlign: 'left', disabled: () => true },
    { field: 'Summary', header: '摘要', type: 'input', width: '220px', textAlign: 'left' },
    { field: 'DebitAmt', header: '借方金額', width: '110px', format: formatAmount, textAlign: 'right', aggregate: 'sum', disabled: () => true },
    { field: 'CreditAmt', header: '貸方金額', width: '110px', format: formatAmount, textAlign: 'right', aggregate: 'sum', disabled: () => true },
    {
      field: 'DeptCode', header: '組織代號', width: '110px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.orgOptions$, optionLabel: 'value', optionValue: 'value',
      templateLabel: 'label', showClear: false,
      onChange: (rowData: PostingLine, value: string) => {
        if (value) {
          this.dropdown.querySys3100().subscribe(options => {
            const selected = options?.find(opt => opt.value === value);
            if (selected) {
              rowData.DeptName = (selected as unknown as { Name: string }).Name;
            }
          });
        } else {
          rowData.DeptName = '';
        }
      }
    },
    { field: 'DeptName', header: '組織名稱', width: '110px', textAlign: 'left', disabled: () => true },
    { field: 'PTA', header: '立沖代號', textAlign: 'left', type: 'input', disabled: () => true, width: '70px' },
    { field: 'ActivityCode', header: '活動代號', width: '110px', textAlign: 'left', disabled: () => true }, // SP_FIN23020Posting目前無對應參數，僅供顯示
  ];

  ngOnInit(): void {
    this.initializePage('FIN23020', this.dataForm);
    this.formTitle = '暫付款申請拋轉傳票預覽';

    const items = this.rowdata?.items ?? [];
    if (items.length === 0) return;

    this.loading = true;
    const requests = items.map(item => this.fin23020Service.detailFIN23020({ id: item.id }));
    forkJoin(requests).pipe(
      finalize(() => { this.loading = false; }),
      untilDestroyed(this),
    ).subscribe({
      next: results => {
        // 表頭：每筆 SP_FIN23020Detail 回傳的表頭都是同一套「目前登入者+今天日期」樣板，取第一筆帶入即可
        const firstHeader = results[0]?.Data?.Header;
        if (firstHeader) {
          this.dataForm.patchValue(firstHeader, { emitEvent: false });
        }
        // 傳票日期改用查詢頁選的值(將實際送給 SP_FIN23020Posting 的 @VouDate)，
        // 蓋掉 SP_FIN23020Detail 預覽固定回傳的「今天」，避免顯示跟實際拋轉的日期不一致
        if (this.rowdata?.VouDate) {
          this.dataForm.patchValue({ VouDate: this.rowdata.VouDate }, { emitEvent: false });
        }

        // 明細：攤平所有筆的借貸兩筆，重新編號序號10/20/30/40...
        const lines: PostingLine[] = [];
        results.forEach((res, idx) => {
          const item = items[idx];
          const details = res.Data?.Details ?? [];
          details.forEach(line => {
            lines.push({
              ...line,
              _sourceId: item.id,
              _prepNo: item.PrepNo,
              _isDebit: Number(line.DebitAmt) > 0,
            });
          });
        });
        lines.forEach((line, idx) => { line.SeqNo = (idx + 1) * 10; });
        this.data = lines;
        // 只有真的成功拿到資料才顯示表格；失敗時保持 initTable=false，不會顯示一張空表格誤導使用者
        this.initTable = true;
      },
      error: () => {
        this.messageService.errorBubble('讀取拋轉預覽資料失敗，請返回查詢頁重新查詢後再試一次');
      }
    });
  }

  /**
   * 確定拋轉：把攤平表格依 _sourceId 分組還原成「每筆暫付款各自一組借貸」，
   * 對每一組各自呼叫一次 postingFIN23020(對應 SP_FIN23020Posting)，一筆暫付款＝一張傳票。
   */
  onConfirmPosting() {
    if (!this.isFormCreateable) return;
    if (this.data.length === 0) return;

    const grouped = new Map<number, PostingLine[]>();
    this.data.forEach(line => {
      const arr = grouped.get(line._sourceId) ?? [];
      arr.push(line);
      grouped.set(line._sourceId, arr);
    });

    const vouSummary = this.dataForm.value.VouSummary ?? undefined;
    // VouDate 控制項是 disabled，Angular 的 dataForm.value 不會帶出 disabled 欄位的值，
    // 直接從導頁帶進來的 rowdata 讀取(而不是從表單)，避免讀到 undefined
    const vouDate = this.rowdata?.VouDate ?? undefined;
    const entries = Array.from(grouped.entries());

    this.messageService.confirm({
      header: '拋轉確認',
      message: `是否確定拋轉這 ${entries.length} 筆暫付款申請?`,
      accept: () => {
        this.loading = true;

        const requests = entries.map(([id, lines]) => {
          const debit = lines.find(l => l._isDebit);
          const credit = lines.find(l => !l._isDebit);
          const request: PostingFIN23020Request = {
            id,
            CreditAccNo: credit?.AcctCode ?? undefined,
            DebitOrgId: debit?.DeptCode ?? undefined,
            CreditOrgId: credit?.DeptCode ?? undefined,
            DebitOffsetNo: debit?.OffsetCode ?? undefined,
            DebitSummary: debit?.Summary ?? undefined,
            CreditSummary: credit?.Summary ?? undefined,
            VouSummary: vouSummary,
            VouDate: vouDate,
          };
          return this.fin23020Service.postingFIN23020(request);
        });

        forkJoin(requests).pipe(
          finalize(() => this.loading = false),
          untilDestroyed(this),
        ).subscribe(results => {
          const failMessages: string[] = [];
          let successCount = 0;

          results.forEach((res, idx) => {
            const prepNo = entries[idx][1][0]?._prepNo;
            if (res?.Data?.Success) {
              successCount++;
            } else {
              failMessages.push(`${prepNo}：${res?.Data?.Message || '拋轉失敗'}`);
            }
          });

          const summary = failMessages.length
            ? `成功 ${successCount} 筆，失敗 ${failMessages.length} 筆：<br>${failMessages.join('<br>')}`
            : `成功 ${successCount} 筆`;

          setTimeout(() => {
            this.messageService.confirm({
              header: failMessages.length ? '拋轉完成(部分失敗)' : '拋轉成功',
              message: summary,
              icon: failMessages.length ? 'pi pi-exclamation-triangle' : 'pi pi-check-circle',
              acceptLabel: '確定',
              showRejectButton: false,
              accept: () => this.onCancel(),
            });
          }, 0);
        });
      }
    });
  }
}

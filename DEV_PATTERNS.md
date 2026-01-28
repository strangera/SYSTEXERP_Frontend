# TSRDERP Frontend - Development Patterns Guide

This document provides detailed development patterns, API references, and code examples for the TSRDERP Frontend project.

> **For project overview and basic setup, see [CLAUDE.md](./CLAUDE.md)**

---

## Table of Contents

1. [Base Component Classes](#1-base-component-classes)
   - [BasicQueryPageComponent](#11-basicquerypagecomponent)
   - [BasicCruPageComponent](#12-basiccrupagecomponent)
2. [Enums and Interfaces](#2-enums-and-interfaces)
   - [CRUDStatus](#21-crudstatus)
   - [ItemOperationStatus](#22-itemoperationstatus)
   - [Actions (Permissions)](#23-actions-permissions)
   - [FunsrightInfo](#24-funsrightinfo)
   - [UserInfo](#25-userinfo)
   - [BaseQueryRequest/Response](#26-basequeryrequest--response)
3. [Component Kit](#3-component-kit)
   - [InputTextComponent](#31-inputtextcomponent)
   - [DropdownComponent](#32-dropdowncomponent)
   - [CalendarComponent](#33-calendarcomponent)
   - [TableComponent](#34-tablecomponent)
   - [Column Definition](#35-column-definition)
   - [MultiSelectComponent](#36-multiselectcomponent)
   - [ButtonComponent](#37-buttoncomponent)
4. [Service Patterns](#4-service-patterns)
   - [API Service](#41-api-service)
   - [Basic Service (Dropdown)](#42-basic-service-dropdown)
5. [Utility Functions](#5-utility-functions)
6. [Complete Page Examples](#6-complete-page-examples)
   - [Query Page](#61-query-page)
   - [CRU Page](#62-cru-page)
7. [Multi-step Workflow Pattern](#7-multi-step-workflow-pattern)
8. [Best Practices](#8-best-practices)

---

## 1. Base Component Classes

### 1.1 BasicQueryPageComponent

**Location**: `src/app/shared/componentextends/basic-qpage/basic-query-page.component.ts`

Base class for query/list pages with built-in pagination, permissions, and navigation.

#### Properties

```typescript
// User and permissions
user?: UserInfo | null;                    // Current user info
funInfo?: FunsrightInfo;                   // Permission info
ProgNo: string;                            // Program code (e.g., 'FIN11010')
cruPage: string;                           // CRU page route

// Injected services (available via super())
router: Router;
messageService: NotificationService;
authService: AuthService;
formBuilder: FormBuilder;
queryStateService: QueryStateService;
currentPageService: CurrentPageService;
systemDataService: SystemDataService;

// State
loading: boolean;
submitted: boolean;
```

#### Methods

```typescript
/**
 * Initialize page - MUST call in ngOnInit
 * @param progNo - Program code
 * @param cruPage - CRU page route (optional)
 * @param queryForm - Query form group (optional)
 * @param onSubmit - Submit callback (optional)
 */
initializePage(
  progNo: string,
  cruPage?: string,
  queryForm?: FormGroup,
  onSubmit?: (form: FormGroup) => void
): void

/**
 * Navigate to CRU page with state
 */
navigateWithState(
  crudstatus: CRUDStatus,
  rowdata?: T,
  queryConditions?: any
): void

// Shortcut navigation methods
onCreate(data?: unknown, queryConditions?: any): void
onEdit(data: T, queryConditions?: any): void
onDetail(data: T, queryConditions?: any): void
onCopy(data: T): void

/**
 * Handle form submission with validation
 */
handleSubmit(queryForm: FormGroup, callback: () => void): void

/**
 * Check user permission
 * @param action - Permission code ('10'=Query, '20'=Create, '30'=Edit, '40'=Delete)
 */
hasPermission(action: string): boolean
```

#### Usage Example

```typescript
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs/operators';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '@shared/models/table/table.model';

@UntilDestroy()
@Component({
  selector: 'app-fin11010',
  templateUrl: './fin11010.component.html',
  standalone: true,
  imports: [/* ... */]
})
export class FIN11010Component extends BasicQueryPageComponent<FIN11010Data> implements OnInit {

  queryForm = this.formBuilder.group({
    STO_Uniform: ['', [Validators.maxLength(8)]],
    STO_TaxName: ['', [Validators.maxLength(60)]],
    REP_OrgCodeList: [[]],
    ...createPaginationConfig([{ field: 'REP_BegGUIYM', order: 1 }])
  });

  data: FIN11010Data[] = [];
  totalRecords = 0;
  selectedItems: FIN11010Data[] = [];

  columns: Column[] = [
    { field: 'STO_Uniform', header: '營業人統編', visible: true },
    { field: 'STO_TaxName', header: '營業人名稱', visible: true },
  ];

  constructor(private fin11010Service: FIN11010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11010', 'fin/fin11010cru', this.queryForm,
      (form) => this.onSubmit(form)
    );
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.fin11010Service.queryFIN11010(frm.value)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }
}
```

---

### 1.2 BasicCruPageComponent

**Location**: `src/app/shared/componentextends/basic-crupage/basic-cru-page.component.ts`

Base class for Create/Read/Update pages.

#### Properties

```typescript
// CRUD state
crudstatus: CRUDStatus = CRUDStatus.Read;  // Current operation
formTitle: string;                          // Form title (auto-set)

// Data from query page
rowdata: T | null = null;                   // Row data passed from query
queryData: any;                             // Query conditions
user: UserInfo;
previousRoute: string | null = null;

// State
loading: boolean;
submitted: boolean;
useReadonlyInsteadOfDisable: boolean;

// Injected services
authService: AuthService;
router: Router;
messageService: NotificationService;
formBuilder: FormBuilder;
formLabelService: FormLabelService;
systemDataService: SystemDataService;
```

#### Getters

```typescript
get isFormEditable(): boolean     // crudstatus === Edit && hasPermission('30')
get isFormCreateable(): boolean   // crudstatus === Create && hasPermission('20')
get isFormReadable(): boolean     // crudstatus === Read

// Permission checks
canAdd(): boolean                 // hasPermission('20')
canEdit(): boolean                // hasPermission('30')
```

#### Methods

```typescript
/**
 * Initialize page - MUST call in ngOnInit
 */
initializePage(
  progNo: string,
  form?: FormGroup,
  options?: { useReadonly?: boolean }
): void

/**
 * Handle form submission with validation and permission check
 */
handleSubmit(frm: FormGroup | null, callback: () => void): void

/**
 * Return to query page
 */
onCancel(returnValue?: any): void

hasPermission(action: string): boolean
```

#### Usage Example

```typescript
@UntilDestroy()
@Component({
  selector: 'app-fin11010-cru',
  templateUrl: './fin11010-cru.component.html',
  standalone: true,
  imports: [/* ... */]
})
export class FIN11010CRUComponent extends BasicCruPageComponent<FIN11010Data> implements OnInit {

  dataForm = this.formBuilder.nonNullable.group({
    id: [0],
    STO_Uniform: ['', [Validators.required, Validators.maxLength(8)]],
    STO_TaxName: ['', [Validators.required, Validators.maxLength(60)]],
    REP_OrgCode: ['', Validators.required],
  });

  constructor(private fin11010Service: FIN11010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11010', this.dataForm);

    // Load default data on create
    if (this.crudstatus === CRUDStatus.Create) {
      this.fin11010Service.getFIN11010PreviousData().subscribe(res => {
        if (res?.Data) {
          this.dataForm.patchValue(res.Data);
        }
      });
    }
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      if (this.isFormCreateable) {
        this.fin11010Service.insertFIN11010(form.getRawValue())
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(() => {
            this.messageService.success('新增成功');
            this.onCancel();
          });
      } else if (this.isFormEditable) {
        this.fin11010Service.updateFIN11010(form.getRawValue())
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(() => {
            this.messageService.success('更新成功');
            this.onCancel();
          });
      }
    });
  }
}
```

---

## 2. Enums and Interfaces

### 2.1 CRUDStatus

**Location**: `src/app/shared/models/system/crudstatus.enum.ts`

```typescript
export enum CRUDStatus {
  Create = 'Create',   // 新增
  Read = 'Read',       // 查看
  Edit = 'Edit',       // 編輯
  Delete = 'Delete',   // 刪除
}
```

### 2.2 ItemOperationStatus

```typescript
export enum ItemOperationStatus {
  Original = 'original',  // 未修改
  New = 'new',           // 新增
  Modified = 'modify',   // 修改
  Deleted = 'delete',    // 刪除
}
```

### 2.3 Actions (Permissions)

**Location**: `src/app/shared/service/permission-guard.service.ts`

```typescript
export enum Actions {
  // CRUD basics
  Query = '10',           // 查詢/讀取 (R)
  Create = '20',          // 新增 (C)
  Edit = '30',            // 修改 (U)
  Delete = '40',          // 刪除 (D)

  // Import/Export
  Report = '50',          // 報表
  Print = '60',           // 匯出 PDF
  ExportExcel = '70',     // 匯出 EXCEL
  ExcelImport = '130',    // 匯入 EXCEL
  ImportCSV = '240',      // 匯入 CSV

  // Files
  Upload = '440',         // 上傳
  Download = '100',       // 下載

  // Approval
  Audit = '80',           // 審核
  AntiAudit = '90',       // 反審核
  Invalidate = '110',     // 作廢

  // Others
  Preview = '280',        // 預覽
  Trial = '500',          // 試算
  Settle = '420',         // 結算
}
```

### 2.4 FunsrightInfo

**Location**: `src/app/shared/models/system/funsright.interface.ts`

```typescript
export interface FunsrightInfo {
  id: string;
  prog_No: string;             // Program code
  prog_id: string;
  prog_name: string;           // Program name
  prog_up: string;
  module_no: string;
  sub_module_no: string;
  prog_ispage: string;
  prog_stopflag: string;
  prog_sort: string;
  icon?: string;
  label?: string;              // prog_No + prog_name
  PrivilegeBehavior?: BehaviorType[];
}

export interface BehaviorType {
  function_code: string;       // Permission code
  function_desc: string;
  sort: number;
}
```

### 2.5 UserInfo

**Location**: `src/app/shared/models/system/user.interface.ts`

```typescript
export interface UserInfo {
  AccessToken: string;
  SYS_StoreNo: string;
  USER_PwdExpireDate: string;
  id: number;
  user_Name: string;
  user_No: string;
  user_email: string;
  client_ip: string;
  CompNo: string;
}
```

### 2.6 BaseQueryRequest / Response

**Location**: `src/app/shared/models/api/base-api.interface.ts`

```typescript
export interface BaseQueryRequest {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: SortOption[];
}

export interface BaseQueryResponse<T> {
  Status: string;
  Data: T[];
  Error?: ApiError;
  Meta?: ApiMeta;
  Message: string;
  TotalCount: number;
  TotalPage: number;
}
```

---

## 3. Component Kit

**Location**: `src/app/shared/componentkit/`

### 3.1 InputTextComponent

```typescript
// Inputs
@Input() label: string;
@Input() controlName: string;
@Input() control: FormControl;
@Input() submitted: boolean;
@Input() readonly: boolean = false;
@Input() disabled: boolean = false;
@Input() maxLength: number | null;
@Input() customPlaceholder: string;
@Input() keyFilter: KeyFilterPattern;      // 'int' | 'pint' | 'num' | 'pnum' | 'alpha' | 'alphanum'
@Input() autoPadZero: boolean;             // Auto-pad zeros
@Input() padLength: number = 16;
@Input() showLabel: boolean = true;
@Input() showErrorMessage: boolean = true;

// Outputs
@Output() inputChange: EventEmitter<Event>;
@Output() blurEvent: EventEmitter<string>;
@Output() clickButton: EventEmitter<unknown>;
```

**Usage:**
```html
<app-input-text
  label="營業人統編"
  controlName="STO_Uniform"
  [control]="form.controls.STO_Uniform"
  [submitted]="submitted"
  [maxLength]="8"
  keyFilter="alphanum"
  customPlaceholder="請輸入營業人統編">
</app-input-text>
```

### 3.2 DropdownComponent

```typescript
// Inputs
@Input() label: string;
@Input() controlName: string;
@Input() control: FormControl;
@Input() options: any[];
@Input() optionLabel: string = 'label';
@Input() optionValue: string;
@Input() optionDisabled: string;
@Input() customPlaceholder: string = '請選擇';
@Input() showClear: boolean = true;
@Input() filter: boolean = true;
@Input() disabled: boolean = false;
@Input() readonly: boolean = false;
@Input() loading: boolean = false;
@Input() submitted: boolean = false;

// Outputs
@Output() changeEvent: EventEmitter<DropdownChangeEvent>;
@Output() valueChange: EventEmitter<any>;
```

**Usage:**
```html
<app-dropdown
  label="總繳代號"
  controlName="REP_OrgCode"
  [control]="form.controls.REP_OrgCode"
  [options]="repOrgCodeOptions"
  optionLabel="Name"
  optionValue="No"
  [submitted]="submitted"
  (valueChange)="onOrgCodeChange($event)">
</app-dropdown>
```

### 3.3 CalendarComponent

```typescript
type CalendarType = 'timeOne' | 'dateOne' | 'dateTimeOne' | 'dateMonthOne' | 'dateYearOne';

// Inputs
@Input() label: string;
@Input() controlName: string;
@Input() control: FormControl;
@Input() calendarType: CalendarType = 'dateOne';
@Input() dateFormat: string = 'yy/mm/dd';
@Input() showTime: boolean = false;
@Input() minDate: Date | null;
@Input() maxDate: Date | null;
@Input() readonly: boolean = false;
@Input() disabled: boolean = false;
@Input() submitted: boolean = false;

// Outputs
@Output() calendarEvent: EventEmitter<any>;
@Output() inputChange: EventEmitter<string>;
```

**Usage:**
```html
<app-calendar
  label="申報年月(起)"
  controlName="REP_BegGUIYM"
  [control]="form.controls.REP_BegGUIYM"
  calendarType="dateMonthOne"
  [submitted]="submitted">
</app-calendar>
```

### 3.4 TableComponent

```typescript
// Core inputs
@Input() tableKey: string;                 // Unique key for state
@Input() title: string;
@Input() columns: Column[];
@Input() data: any[] = [];
@Input() dataKey: string = 'ID';
@Input() totalRecords: number;
@Input() lazy: boolean = false;
@Input() loading: boolean = false;
@Input() disabled: boolean = false;

// Selection
@Input() showCheckBox: boolean = false;
@Input() selectionMode: 'multiple' | 'single';
@Input() selectedItems: any[] = [];

// Display features
@Input() showCaption: boolean = true;
@Input() showHeader: boolean = true;
@Input() showFilter: boolean = true;
@Input() showReportMode: boolean = true;
@Input() showReportPDF: boolean = true;
@Input() showReportExcel: boolean = true;
@Input() showInsert: boolean = false;
@Input() showEdit: boolean = true;
@Input() showDelete: boolean = true;
@Input() showDetail: boolean = true;

// Buttons and actions
@Input() addButton: AddButton[];
@Input() editDisabled: (row: any) => boolean;
@Input() deleteDisabled: (row: any) => boolean;

// Outputs
@Output() edit: EventEmitter<any>;
@Output() delete: EventEmitter<any>;
@Output() detail: EventEmitter<any>;
@Output() insert: EventEmitter<any>;
@Output() lazyLoadData: EventEmitter<LazyLoadEvent>;
@Output() selectionChange: EventEmitter<any[]>;
```

**Usage:**
```html
<app-table
  tableKey="FIN11010"
  title="營業人管理"
  [data]="data"
  [columns]="columns"
  [totalRecords]="totalRecords"
  [lazy]="true"
  [loading]="loading"
  [selectedItems]="selectedItems"
  (selectionChange)="selectedItems = $event"
  (lazyLoadData)="onLazyLoadData($event, queryForm); onSubmit(queryForm)"
  (edit)="onEdit($event)"
  (detail)="onDetail($event)"
  (delete)="onDelete($event)">
</app-table>
```

### 3.5 Column Definition

**Location**: `src/app/shared/models/table/table.model.ts`

```typescript
export interface Column<T = Record<string, any>> {
  field: keyof T;                           // Data field name
  header: string;                           // Display header
  align?: 'left' | 'center' | 'right';
  visible?: boolean;                        // Show in table
  hidden?: boolean;                         // Hide from filter
  frozen?: boolean;                         // Freeze column

  // Formatting
  format?: (value: any, index?: number, rowData?: any) => string | number | null;
  htmlFormat?: boolean;

  // Table cell type
  type?: TableTypes;
  options?: any | ((rowData: any) => any);
  optionLabel?: string;
  optionValue?: string;
  required?: boolean;
  validate?: ((value: string, rowData: any, data: any[], field: string) => any)[];
  disabled?: (value: any) => boolean;

  // Numbers
  prefix?: string;
  suffix?: string;
  fractionDigits?: number;
  useGrouping?: boolean;                    // Thousand separator

  // Totals
  isSubTotal?: boolean;
  isTotal?: boolean;

  // Events
  onChange?: (rowData: any, value: any, col: Column) => void;
}

export type TableTypes =
  | 'input'
  | 'inputNumber'
  | 'percent'
  | 'dropdown'
  | 'button'
  | 'html'
  | 'date'
  | 'autoComplete'
  | 'image'
  | 'default'
  | 'dropdownTable'
  | 'template'
  | 'detail'
  | 'link';
```

**Usage:**
```typescript
columns: Column[] = [
  { field: 'STO_Uniform', header: '營業人統編', visible: true },
  { field: 'STO_TaxName', header: '營業人名稱', visible: true },
  {
    field: 'STO_City',
    header: '縣市別',
    visible: true,
    format: (value: string) => this.getSYS1000('STO_City', value)
  },
  {
    field: 'Amount',
    header: '金額',
    visible: true,
    align: 'right',
    format: formatAmount,
    isTotal: true
  },
  {
    field: 'STO_Status',
    header: '狀態',
    visible: true,
    type: 'dropdown',
    options: this.statusOptions,
    optionLabel: 'label',
    optionValue: 'value'
  },
];
```

### 3.6 MultiSelectComponent

```typescript
@Input() label: string;
@Input() control: FormControl;
@Input() options: any[];
@Input() optionLabel: string;
@Input() optionValue: string;
@Input() filter: boolean = true;
@Input() showToggleAll: boolean = true;
@Input() customPlaceholder: string;
```

**Usage:**
```html
<app-multi-select
  label="總繳代號"
  controlName="REP_OrgCodeList"
  [control]="form.controls.REP_OrgCodeList"
  [options]="orgCodeOptions"
  optionLabel="label"
  optionValue="value"
  placeholder="請選擇">
</app-multi-select>
```

### 3.7 ButtonComponent

```typescript
type BtnType = 'query' | 'create' | 'submit' | 'cancel' | 'clear' | 'back' |
               'delete' | 'report' | 'export' | 'import' | 'save' | 'print' |
               'default' | 'audit' | 'anti-audit';

@Input() btnType: BtnType = 'default';
@Input() label: string;
@Input() icon: string;
@Input() loading: boolean = false;
@Input() disabled: boolean = false;
@Input() form: FormGroup;                  // For 'clear' type
```

**Usage:**
```html
<app-button btnType="query" [loading]="loading"></app-button>
<app-button btnType="create" (click)="onCreate()" label="新增"></app-button>
<app-button btnType="clear" [form]="queryForm"></app-button>
<app-button btnType="back" (click)="onCancel()"></app-button>
```

---

## 4. Service Patterns

### 4.1 API Service

**Location**: `src/app/service/api/`

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';

// Define request/response models
export interface FIN11010QueryRequest extends BaseQueryRequest {
  STO_Uniform?: string;
  STO_TaxName?: string;
  REP_OrgCodeList?: string[];
}

export interface FIN11010Data {
  id: number;
  STO_Uniform: string;
  STO_TaxName: string;
  // ... fields
}

@Injectable({ providedIn: 'root' })
export class FIN11010Service {
  private readonly apiUrl = environment.ApiUrl + '/FIN0000/FIN1000';

  constructor(private http: HttpClient) { }

  queryFIN11010(payload: FIN11010QueryRequest): Observable<BaseQueryResponse<FIN11010Data>> {
    return this.http.post<BaseQueryResponse<FIN11010Data>>(
      `${this.apiUrl}/QueryFIN11010`,
      payload
    );
  }

  insertFIN11010(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/InsertFIN11010`, payload);
  }

  updateFIN11010(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/UpdateFIN11010`, payload);
  }

  deleteFIN11010(idList: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/DeleteFIN11010`, { idList });
  }

  getFIN11010PreviousData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/GetFIN11010PreviousData`);
  }
}
```

### 4.2 Basic Service (Dropdown)

**Location**: `src/app/service/basic/`

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class DeductionService {
  private apiUrl = environment.ApiUrl;
  title = '扣款類別';

  constructor(private http: HttpClient) { }

  getAPS1003DropDownList(payload: { cap_typeList: string[] }): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/queryAPS1003_DropDownList`, payload)
      .pipe(
        map((res) =>
          res?.Data?.map((x: any) => ({
            label: x.Name,
            value: x.No
          })) ?? []
        ),
      );
  }
}
```

---

## 5. Utility Functions

**Location**: `src/app/shared/models/table/table.model.ts`

```typescript
// Date formatting
formatDate(dateStr: string): string                    // -> '2024/05/27'
formatDateTime(dateStr: string): string                // -> '2024/05/27 14:30:25'
formatYYYYMM(value: string | Date): string             // -> '2024/05'

// Amount formatting
formatAmount(val: number | string): string             // -> '1,000,000'
formatAmountNo0(val: number | string): string          // -> '' if 0

// Y/N conversion
formatYN(value: string): string                        // 'Y' -> '是', 'N' -> '否'

// Time formatting
formatTimeHHMM(value: string | number | Date): string  // -> '14:30'
formatTimeHHMMSS(value: string | number | Date): string // -> '14:30:25'

// Percentage
formatPercentage(value: number | string, fractionDigits = 0): string // -> '25.5%'

// Date conversion
formatYYYYMMToDate(value: string): Date | null         // '202405' -> Date
convertDateToYYYYMM(date: any): string                 // Date -> '202405'

// Pagination config helper
createPaginationConfig(sortBy: SortOption[]): PaginationConfig
```

---

## 6. Complete Page Examples

### 6.1 Query Page

**HTML Template:**
```html
<!-- query-page.component.html -->
<div class="card">
  <!-- Header with menubar and buttons -->
  <div class="flex gap-2 mb-2">
    <app-menubar [ProgNo]="ProgNo" class="flex-1"></app-menubar>
    <app-button btnType="report" (click)="onExport()" label="匯出"
      [disabled]="data.length === 0" [loading]="exportLoading"></app-button>
    <app-button btnType="create" (click)="onCreate()" label="新增"></app-button>
  </div>

  <!-- Query form in accordion -->
  <p-accordion>
    <p-accordionTab header="查詢條件" [selected]="true">
      <form [formGroup]="queryForm" (ngSubmit)="onSubmit(queryForm)">
        <div class="grid p-fluid">
          <app-input-text class="col-12 md:col-6 lg:col-4"
            label="營業人統編"
            controlName="STO_Uniform"
            [control]="queryForm.controls.STO_Uniform"
            [submitted]="submitted">
          </app-input-text>

          <app-multi-select class="col-12 md:col-6 lg:col-4"
            label="總繳代號"
            controlName="REP_OrgCodeList"
            [options]="orgCodeOptions"
            optionLabel="label"
            optionValue="value"
            [control]="queryForm.controls.REP_OrgCodeList"
            [submitted]="submitted">
          </app-multi-select>

          <app-calendar class="col-12 md:col-6 lg:col-4"
            label="申報年月(起)"
            controlName="REP_GUIYM_start"
            [control]="queryForm.controls.REP_GUIYM_start"
            calendarType="dateMonthOne"
            [submitted]="submitted">
          </app-calendar>
        </div>

        <div class="grid justify-content-end gap-2 mt-2 pt-3 border-top-1">
          <app-button btnType="clear" [form]="queryForm"></app-button>
          <app-button btnType="query" [loading]="loading"></app-button>
        </div>
      </form>
    </p-accordionTab>
  </p-accordion>
</div>

<!-- Results table -->
<div class="card">
  <app-table
    tableKey="FIN11010"
    [data]="data"
    [columns]="columns"
    [totalRecords]="totalRecords"
    [lazy]="true"
    [loading]="loading"
    [selectedItems]="selectedItems"
    (selectionChange)="selectedItems = $event"
    (lazyLoadData)="onLazyLoadData($event, queryForm); onSubmit(queryForm)"
    (edit)="onEdit($event)"
    (detail)="onDetail($event)">
  </app-table>
</div>
```

### 6.2 CRU Page

**HTML Template:**
```html
<!-- cru-page.component.html -->
<div class="card">
  <div class="flex gap-2 mb-2">
    <app-menubar [ProgNo]="ProgNo" class="flex-1"></app-menubar>
    <app-button btnType="back" (click)="onCancel()"></app-button>
  </div>

  <p-panel [header]="formTitle">
    <form [formGroup]="dataForm" (ngSubmit)="onSubmit(dataForm)">
      <div class="grid p-fluid">
        <app-input-text class="col-12 md:col-6 lg:col-4"
          label="營業人統編"
          controlName="STO_Uniform"
          [control]="dataForm.controls.STO_Uniform"
          [submitted]="submitted">
        </app-input-text>

        <app-dropdown class="col-12 md:col-4 lg:col-2"
          label="縣市別"
          controlName="STO_City"
          [options]="cityOptions"
          optionLabel="Name"
          optionValue="No"
          [control]="dataForm.controls.STO_City"
          [submitted]="submitted">
        </app-dropdown>
      </div>

      <!-- Hide submit buttons in read mode -->
      <div *ngIf="!isFormReadable" class="grid justify-content-end gap-2 mt-2 pt-3 border-top-1">
        <app-button btnType="cancel" (click)="onCancel()"></app-button>
        <app-button btnType="submit" [loading]="loading"></app-button>
      </div>
    </form>
  </p-panel>
</div>
```

---

## 7. Multi-step Workflow Pattern

**Example**: TLS13010 Contract Management (`src/app/pages/tls/tls13010/`)

### Workflow Structure

```
TLS13010 (Query)
    ↓
TLS13010-CRU (Step 1: Basic Info)
    ↓
TLS13010-Next1 (Step 2: Deductions)
    ↓
TLS13010-Next2 (Step 3: Commissions)
    ↓
TLS13010-Next3 (Step 4: Conditions)
```

### ContractFlowService Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class ContractFlowService {
  private readonly STORAGE_KEY = 'TLS13010_CONTRACT_FLOW';
  private memoryCache = new Map<string, any>();

  private contractData: ContractDataStructure = {
    contractId: null,
    queryRowData: null,
    step1: null,
    step2: [],
    step3: [],
    step4: [],
    dataToDelete: null,
    metadata: { lastModified: null, version: 1 }
  };

  private workflowStatusSubject = new BehaviorSubject<WorkflowStatus>(this.initializeStatus());
  public workflowStatus$ = this.workflowStatusSubject.asObservable();

  getStep1Data(): ContractInfo | null {
    return this.contractData.step1;
  }

  setStep1Data(data: ContractInfo): void {
    this.contractData.step1 = data;
    this.contractData.metadata.lastModified = new Date();
    this.saveToStorage();
  }

  private saveToStorage(): void {
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.contractData));
  }

  private loadFromStorage(): void {
    const stored = sessionStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.contractData = JSON.parse(stored);
    }
  }
}
```

---

## 8. Best Practices

### Naming Conventions

```typescript
// Program codes: {Module}{5-digit-number}
// Examples: FIN11010, TLS13010, ASS11010

// File naming: kebab-case
// Examples: fin11010.component.ts, query-state.service.ts

// CSS classes: Follow PrimeFlex conventions
// Examples: p-fluid, col-12, md:col-6, lg:col-4, grid, gap-2
```

### Permission Checking Flow

```typescript
// 1. In query page - check query permission
if (this.hasPermission(Actions.Query)) {
  // Show query form
}

// 2. Check create permission for button
if (this.hasPermission(Actions.Create)) {
  // Show create button
}

// 3. In CRU page - manage based on status
if (this.isFormCreateable) {
  // Execute create logic
} else if (this.isFormEditable) {
  // Execute edit logic
}
```

### Form Validation

```typescript
dataForm = this.formBuilder.nonNullable.group({
  fieldName: [
    defaultValue,
    [
      Validators.required,
      Validators.maxLength(50),
      Validators.min(0),
      Validators.max(100),
      this.validationService.phoneNumberValidator,
    ]
  ]
});
```

### Async Operations

```typescript
import { untilDestroyed } from '@ngneat/until-destroy';

this.service.getData()
  .pipe(
    untilDestroyed(this),                    // Auto-unsubscribe on destroy
    finalize(() => this.loading = false),    // Always run after complete
    catchError(err => {
      this.messageService.error('發生錯誤');
      return of([]);
    })
  )
  .subscribe(data => {
    this.data = data;
  });
```

### Query State Persistence

```typescript
// Save query state after successful search
this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());

// Navigate with state to CRU page
this.navigateWithState(CRUDStatus.Edit, rowdata, queryConditions);

// State is auto-restored when returning from CRU page
```

---

## Quick Reference

| Task | Pattern |
|------|---------|
| Create query page | Extend `BasicQueryPageComponent` |
| Create CRU page | Extend `BasicCruPageComponent` |
| Check permission | `this.hasPermission('20')` or `Actions.Create` |
| Navigate to CRU | `this.navigateWithState(CRUDStatus.Edit, data)` |
| Submit form | `this.handleSubmit(form, () => { ... })` |
| Save query state | `this.queryStateService.setQueryState(key, value)` |
| Auto-unsubscribe | `pipe(untilDestroyed(this))` |
| Format amount | `formatAmount(value)` |
| Format date | `formatDate(value)` |

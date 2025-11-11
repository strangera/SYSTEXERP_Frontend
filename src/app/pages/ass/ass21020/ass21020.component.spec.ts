import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ASS21020Service } from '@service/api/ass/ass21020.service';
import { AuthService } from '@service/system/auth.service';
import { SystemDataService } from '@service/system/system-data.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { QueryStateService } from '@shared/service/query-state.service';
import { of } from 'rxjs';
import { CurrentPageService } from 'src/app/core/layout/app.menulist/current-page.service';
import { ASS21020Component } from './ass21020.component';

/**
 * 測試目標：
 * 1. 組件建立與表單控制項
 * 2. tltNoEffect 依 TLT_No 自動帶出相關欄位
 * 3. onSubmit 過濾 Location_No/NET_SPACE 並呼叫 loadASS21020
 * 4. onDelete 逐筆呼叫 deleteASS21020
 */

describe('ASS21020Component', () => {
  let component: ASS21020Component;
  let fixture: ComponentFixture<ASS21020Component>;

  const tltFlagMock = {
    TLT_No: 'T001',
    TLT_Name: '專櫃一號',
    Location_No: 'L-01',
    NET_SPACE: 30,
    Apply_No: 'A123'
  };

  const mockService: Partial<ASS21020Service> = {
    ASS21020Data: signal<any[]>([]),
    engTypeOptions: [],
    engTypeMap: new Map([
      ['G01', 'G01'],
      ['G02', 'G02']
    ]),
    engMeterNoOptions: () => [],
    tableLoading: () => !1,
    engMeterNoLoading: () => !1,
    tltByFlagLoading: () => !1,
    tltByFlagMap: () => new Map([[tltFlagMock.TLT_No, tltFlagMock]]),
    getTltByFlags: () => void 0,
    getEngMeterNos: () => void 0,
    loadASS21020: jasmine.createSpy('loadASS21020').and.returnValue(of([])),
    deleteASS21020: jasmine.createSpy('deleteASS21020').and.callFake(() => of(null))
  } as any;

  const mockAuthService: Partial<AuthService> = {
    currentUserValue: { SYS_StoreNo: 'S001', mid: '55' } as any
  } as any;

  const mockNotification: Partial<NotificationService> = {
    blockUi: () => void 0,
    unblockUi: () => void 0,
    successBubble: jasmine.createSpy('successBubble'),
    errorBubble: jasmine.createSpy('errorBubble')
  } as any;

  const mockQueryState: Partial<QueryStateService> = {
    getQueryStateValue: () => void 0,
    setQueryState: jasmine.createSpy('setQueryState')
  } as any;

  const mockCurrentPage: Partial<CurrentPageService> = {
    setCurrentProgNo: () => void 0
  } as any;

  const mockSystemData: Partial<SystemDataService> = {
    getUserPermissions: () => ({
      PrivilegeBehavior: [
        { function_code: '10' }, { function_code: '20' }, { function_code: '30' }, { function_code: '40' }
      ]
    }) as any
  } as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS21020Component],
      providers: [
        { provide: ASS21020Service, useValue: mockService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: NotificationService, useValue: mockNotification },
        { provide: QueryStateService, useValue: mockQueryState },
        { provide: CurrentPageService, useValue: mockCurrentPage },
        { provide: SystemDataService, useValue: mockSystemData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ASS21020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('應成功建立並包含必要表單控制項', () => {
    expect(component).toBeTruthy();
    expect(component.queryForm.contains('TLT_No')).toBeTrue();
    expect(component.queryForm.contains('ENG_MeterNo')).toBeTrue();
  });

  it('tltNoEffect 應依 TLT_No 自動帶入欄位', () => {
    component.queryForm.patchValue({ TLT_No: 'T001' });
    fixture.detectChanges();
    const value = component.queryForm.getRawValue();
    expect(value.TLT_Name).toBe('專櫃一號');
    expect(value.Location_No).toBe('L-01');
    expect(value.NET_SPACE).toBe(String(30));
  });

  it('onSubmit 應過濾 Location_No 與 NET_SPACE 並呼叫 loadASS21020', () => {
    component.queryForm.patchValue({
      ENG_Type: ['G01'] as any,
      ENG_MeterNo: 'M001',
      TLT_No: 'T001',
      Location_No: 'L-01',
      NET_SPACE: '30',
      ENG_Rate: 25
    });
    component.onSubmit();
    expect(mockService.loadASS21020).toHaveBeenCalledTimes(1);
    const arg = (mockService.loadASS21020 as jasmine.Spy).calls.mostRecent().args[0];
    expect(arg.Location_No).toBeUndefined();
    expect(arg.NET_SPACE).toBeUndefined();
    expect(arg.Mid).toBe(55);
    expect(arg.SYS_StoreNo).toBe('S001');
  });

  it('onDelete 應逐筆呼叫 deleteASS21020', () => {
    const rows = [
      { ENG_Type: ['G01'] as any, ENG_MeterNo: 'M001' },
      { ENG_Type: ['G02'] as any, ENG_MeterNo: 'M002' }
    ];
    component.onDelete(rows as any);
    expect(mockService.deleteASS21020).toHaveBeenCalledTimes(2);
    expect(mockNotification.successBubble).toHaveBeenCalled();
  });
});

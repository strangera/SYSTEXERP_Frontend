import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ASS21010Service } from '@service/api/ass/ass21010.service';
import { AuthService } from '@service/system/auth.service';
import { SystemDataService } from '@service/system/system-data.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { QueryStateService } from '@shared/service/query-state.service';
import { of } from 'rxjs';
import { CurrentPageService } from 'src/app/core/layout/app.menulist/current-page.service';
import { ASS21010Component } from './ass21010.component';

/**
 * 單元測試目標：
 * 1. 組件建立與初始表單結構
 * 2. onSubmit 時過濾有效欄位並呼叫 service.loadASS21010
 * 3. onDelete 會逐筆呼叫 delete 並顯示成功訊息
 */

describe('ASS21010Component', () => {
  let component: ASS21010Component;
  let fixture: ComponentFixture<ASS21010Component>;

  // 建立必要服務 Mock（僅覆蓋測試所需方法）
  const mockService: Partial<ASS21010Service> = {
    ASS21010Data: signal<any[]>([]),
    engTypeOptions: [],
    engMeterNoOptions: () => [],
    engTypeMap: new Map([
      ['G01', 'G01'],
      ['G02', 'G02']
    ]),
    tableLoading: () => !1,
    engMeterNoLoading: () => !1,
    locationLoading: () => !1,
    exportLoading: () => !1,
    loadASS21010: jasmine.createSpy('loadASS21010'),
    deleteASS21010: jasmine.createSpy('deleteASS21010').and.callFake(() => of(null)),
    loadEngMeterNo: () => void 0,
    loadLocationNo: () => void 0,
    locationOptions: () => []
  } as any;

  const mockAuthService: Partial<AuthService> = {
    currentUserValue: { SYS_StoreNo: 'S001', mid: '99' } as any,
    getUserInfo: () => ({ user_No: 'U001' } as any)
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
      imports: [ASS21010Component],
      providers: [
        { provide: ASS21010Service, useValue: mockService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: NotificationService, useValue: mockNotification },
        { provide: QueryStateService, useValue: mockQueryState },
        { provide: CurrentPageService, useValue: mockCurrentPage },
        { provide: SystemDataService, useValue: mockSystemData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ASS21010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('應成功建立組件', () => {
    expect(component).toBeTruthy();
    expect(component.queryForm.contains('ENG_Type')).toBeTrue();
    expect(component.queryForm.contains('ENG_MeterNo')).toBeTrue();
  });

  it('onSubmit 應過濾空值並呼叫 service.loadASS21010', () => {
    component.queryForm.patchValue({
      ENG_Type: ['G01', 'G02'] as any,
      ENG_MeterNo: 'M001',
      Location_No: '', // 空值應被過濾
      ENG_Remark: '備註內容'
    });

    component.onSubmit();
    expect(mockService.loadASS21010).toHaveBeenCalledTimes(1);
    const payloadArg = (mockService.loadASS21010 as jasmine.Spy).calls.mostRecent().args[0];
    expect(payloadArg.ENG_Type).toEqual(['G01', 'G02']);
    expect(payloadArg.Location_No).toBeUndefined(); // 空字串過濾
    expect(payloadArg.Mid).toBe(99);
    expect(payloadArg.SYS_StoreNo).toBe('S001');
  });

  it('onDelete 應逐筆呼叫 delete 並顯示成功訊息', () => {
    const rows = [
      { ID: 1, ENG_Type: 'G01', ENG_MeterNo: 'M001', Location_No: 'L1', ENG_Remark: '' },
      { ID: 2, ENG_Type: 'G02', ENG_MeterNo: 'M002', Location_No: 'L2', ENG_Remark: '' }
    ];
    component.onDelete(rows as any);
    expect(mockService.deleteASS21010).toHaveBeenCalledTimes(2);
    expect(mockNotification.successBubble).toHaveBeenCalled();
  });
});

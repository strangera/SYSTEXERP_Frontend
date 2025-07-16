import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BehaviorSubject, of } from 'rxjs';
import { CurrentPageService } from '../../../layout/app.menulist/current-page.service';
import { TLS26010Service } from '../../../service/api/tls/tls26010.service';
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { QueryStateService } from '../../../shared/service/query-state.service';
import { TLS26010Component } from './tls26010.component';

describe('TLS26010Component', () => {
  let component: TLS26010Component;
  let fixture: ComponentFixture<TLS26010Component>;
  let mockTLS26010Service: jasmine.SpyObj<TLS26010Service>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockQueryStateService: jasmine.SpyObj<QueryStateService>;
  let mockCurrentPageService: jasmine.SpyObj<CurrentPageService>;
  let mockConfirmationService: jasmine.SpyObj<ConfirmationService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  // Mock data
  const mockSYS3800Data = [
    { building_no: 'A', building_name: '館別A' },
    { building_no: 'B', building_name: '館別B' }
  ];

  const mockSYS3900Data = [
    { floor_no: '1F', floor_name: '1樓' },
    { floor_no: '2F', floor_name: '2樓' }
  ];

  const mockPreorderECRData = [
    { ECR_No: 'ECR001', ECR_Name: '收銀機001' },
    { ECR_No: 'ECR002', ECR_Name: '收銀機002' }
  ];

  const mockTLTTALENTData = [
    { tlt_no: 'TLT001', tlt_name: '專櫃001' },
    { tlt_no: 'TLT002', tlt_name: '專櫃002' }
  ];

  const mockTLS26010Data = [
    {
      cashRegisterNumber: 'ECR001',
      counterNumber: 'TLT001',
      counterName: '專櫃名稱001',
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    }
  ];

  beforeEach(async () => {
    // Create spy objects
    mockTLS26010Service = jasmine.createSpyObj('TLS26010Service', [
      'loadSYS3800',
      'loadSYS3900',
      'loadPreorderECRList',
      'loadTLTTALENT',
      'loadTLS26010',
      'clearData'
    ]);

    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserPermissions']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['blockUi', 'add']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['blockUi', 'add', 'showSuccess', 'showError']);
    mockQueryStateService = jasmine.createSpyObj('QueryStateService', ['getQueryState', 'setQueryState']);
    mockCurrentPageService = jasmine.createSpyObj('CurrentPageService', ['setCurrentProgNo']);
    mockConfirmationService = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['get']);

    // Setup service spies with signals
    Object.defineProperty(mockTLS26010Service, 'sys3800Data', {
      get: () => signal(mockSYS3800Data),
      configurable: true
    });
    Object.defineProperty(mockTLS26010Service, 'sys3900Data', {
      get: () => signal(mockSYS3900Data),
      configurable: true
    });
    Object.defineProperty(mockTLS26010Service, 'preorderECRData', {
      get: () => signal(mockPreorderECRData),
      configurable: true
    });
    Object.defineProperty(mockTLS26010Service, 'tlttalentData', {
      get: () => signal(mockTLTTALENTData),
      configurable: true
    });
    Object.defineProperty(mockTLS26010Service, 'tls26010Data', {
      get: () => signal(mockTLS26010Data),
      configurable: true
    });
    Object.defineProperty(mockTLS26010Service, 'loading', {
      get: () => signal(false),
      configurable: true
    });

    mockAuthService.getUserPermissions.and.returnValue({
      id: '1',
      prog_No: '220035',
      prog_id: 'TLS26010',
      prog_name: '測試程式',
      prog_up: '',
      module_no: '',
      sub_module_no: '',
      prog_ispage: '',
      prog_stopflag: '',
      prog_sort: '',
      PrivilegeBehavior: [
        { function_code: '10', function_desc: '查詢', sort: 1, CRT_Date: '', CRT_USR_No: '', CRT_USR_Name: '' },
        { function_code: '20', function_desc: '新增', sort: 2, CRT_Date: '', CRT_USR_No: '', CRT_USR_Name: '' },
        { function_code: '30', function_desc: '修改', sort: 3, CRT_Date: '', CRT_USR_No: '', CRT_USR_Name: '' }
      ]
    });

    mockQueryStateService.getQueryState.and.returnValue(new BehaviorSubject(null));
    mockTranslateService.get.and.returnValue(of('測試文字'));

    await TestBed.configureTestingModule({
      imports: [
        TLS26010Component,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        FormBuilder,
        { provide: TLS26010Service, useValue: mockTLS26010Service },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: MessageService, useValue: mockMessageService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: QueryStateService, useValue: mockQueryStateService },
        { provide: CurrentPageService, useValue: mockCurrentPageService },
        { provide: ConfirmationService, useValue: mockConfirmationService },
        { provide: TranslateService, useValue: mockTranslateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TLS26010Component);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with correct structure', () => {
      expect(component.queryForm.get('sys3800')).toBeTruthy();
      expect(component.queryForm.get('sys3900')).toBeTruthy();
      expect(component.queryForm.get('ecrNos')).toBeTruthy();
      expect(component.queryForm.get('tltNos')).toBeTruthy();
      expect(component.queryForm.get('podSdateS')).toBeTruthy();
      expect(component.queryForm.get('podSdateE')).toBeTruthy();
      expect(component.queryForm.get('podEdateS')).toBeTruthy();
      expect(component.queryForm.get('podEdateE')).toBeTruthy();
    }); it('should load initial data on ngOnInit', () => {
      fixture.detectChanges(); // Trigger change detection first
      component.ngOnInit();

      expect(mockTLS26010Service.loadSYS3800).toHaveBeenCalledWith({});
      expect(mockTLS26010Service.loadSYS3900).toHaveBeenCalledWith({});
      expect(mockAuthService.getUserPermissions).toHaveBeenCalledWith('220035');
    });

    it('should initialize columns correctly', () => {
      expect(component.columns).toEqual([
        { field: 'cashRegisterNumber', header: '收銀機代碼', visible: true },
        { field: 'counterNumber', header: '專櫃編號', visible: true },
        { field: 'counterName', header: '櫃位名稱', visible: true },
        { field: 'startDate', header: '起始日期', visible: true },
        { field: 'endDate', header: '截止日期', visible: true }
      ]);
    });
  });

  describe('Permission Methods', () => {
    it('should return correct permissions', () => {
      expect(component.canQuery()).toBe(true);
      expect(component.canAdd()).toBe(true);
      expect(component.canEdit()).toBe(true);
    });
  });

  describe('Form Operations', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should clear form and service data on onClearForm', () => {
      // 設置一些表單值
      component.queryForm.patchValue({
        sys3800: 'A',
        sys3900: '1F',
        ecrNos: ['ECR001'],
        tltNos: ['TLT001']
      });

      component.onClearForm();

      expect(component.queryForm.get('sys3800')?.value).toBeNull();
      expect(component.queryForm.get('sys3900')?.value).toBeNull();
      expect(component.queryForm.get('ecrNos')?.value).toBeNull();
      expect(component.queryForm.get('tltNos')?.value).toBeNull();
      expect(mockTLS26010Service.clearData).toHaveBeenCalled();
    });

    it('should not submit query if ecrNos is empty', () => {
      const mockForm = component.queryForm;
      mockForm.patchValue({
        sys3800: 'A',
        sys3900: '1F',
        ecrNos: [],
        tltNos: ['TLT001']
      });

      spyOn(component, 'onSubmit');
      component.onSubmitQuery(mockForm);

      expect(component.onSubmit).not.toHaveBeenCalled();
    });

    it('should not submit query if tltNos is empty', () => {
      const mockForm = component.queryForm;
      mockForm.patchValue({
        sys3800: 'A',
        sys3900: '1F',
        ecrNos: ['ECR001'],
        tltNos: []
      });

      spyOn(component, 'onSubmit');
      component.onSubmitQuery(mockForm);

      expect(component.onSubmit).not.toHaveBeenCalled();
    });

    it('should submit query when required fields are filled', () => {
      const mockForm = component.queryForm;
      mockForm.patchValue({
        sys3800: 'A',
        sys3900: '1F',
        ecrNos: ['ECR001'],
        tltNos: ['TLT001']
      });

      spyOn(component, 'onSubmit');
      component.onSubmitQuery(mockForm);

      expect(component.onSubmit).toHaveBeenCalledWith(mockForm);
    });
  });

  describe('Date Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    }); it('should validate start date range correctly', () => {
      fixture.detectChanges(); // Initialize component first

      component.queryForm.patchValue({
        podSdateS: '2024-01-15',
        podSdateE: '2024-01-10' // 結束日期小於開始日期
      });

      // Wait for signals to update
      fixture.detectChanges();

      // Access the signal value directly
      const dateValidation = (component as any).dateValidationSignal();
      expect(dateValidation.isValid).toBe(false);
    }); it('should validate end date range correctly', () => {
      fixture.detectChanges();

      component.queryForm.patchValue({
        podEdateS: '2024-01-15',
        podEdateE: '2024-01-10' // 結束日期小於開始日期
      });

      fixture.detectChanges();

      const dateValidation = (component as any).dateValidationSignal();
      expect(dateValidation.isValid).toBe(false);
    });

    it('should validate cross-range logic correctly', () => {
      fixture.detectChanges();

      component.queryForm.patchValue({
        podSdateE: '2024-01-20',
        podEdateS: '2024-01-15' // 起始日期的結束 > 截止日期的開始
      });

      fixture.detectChanges();

      const dateValidation = (component as any).dateValidationSignal();
      expect(dateValidation.isValid).toBe(false);
    });

    it('should pass validation with correct date ranges', () => {
      fixture.detectChanges();

      component.queryForm.patchValue({
        podSdateS: '2024-01-01',
        podSdateE: '2024-01-15',
        podEdateS: '2024-01-16',
        podEdateE: '2024-01-31'
      });

      fixture.detectChanges();

      const dateValidation = (component as any).dateValidationSignal();
      expect(dateValidation.isValid).toBe(true);
    });
  });

  describe('Signal Effects', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should trigger dependent data loading when building and floor are selected', async () => {
      component.queryForm.patchValue({
        sys3800: 'A',
        sys3900: '1F'
      });

      fixture.detectChanges();
      await fixture.whenStable(); // Wait for async operations

      expect(mockTLS26010Service.loadPreorderECRList).toHaveBeenCalled();
      expect(mockTLS26010Service.loadTLTTALENT).toHaveBeenCalled();
    });

    it('should clear ecrNos and tltNos when building changes', async () => {
      // Set initial values
      component.queryForm.patchValue({
        ecrNos: ['ECR001'],
        tltNos: ['TLT001'],
        sys3800: 'A',
        sys3900: '1F'
      });

      fixture.detectChanges();
      await fixture.whenStable();

      // Change building
      component.queryForm.patchValue({
        sys3800: 'B'
      });

      fixture.detectChanges();
      await fixture.whenStable();

      // Verify values are cleared (may need to check after effect execution)
      expect(component.queryForm.get('ecrNos')?.value).toEqual([]);
      expect(component.queryForm.get('tltNos')?.value).toEqual([]);
    });
  });

  describe('Navigation Methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate to create page with correct parameters', () => {
      component.onCreate();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['TLS2000/TLS26010CRU'], {
        state: {
          crudstatus: 'Create',
          queryform: component.queryForm
        },
        skipLocationChange: true
      });
    });

    it('should navigate to edit page with correct parameters', () => {
      const testData = { id: 1, name: 'test' };
      component.onEdit(testData);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['TLS2000/TLS26010CRU'], {
        state: {
          crudstatus: 'Edit',
          rowdata: testData,
          queryform: component.queryForm
        },
        skipLocationChange: true
      });
    });

    it('should navigate to detail page with correct parameters', () => {
      const testData = { id: 1, name: 'test' };
      component.onDetail(testData);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['TLS2000/TLS26010CRU'], {
        state: {
          crudstatus: 'Read',
          rowdata: testData,
          queryform: component.queryForm
        },
        skipLocationChange: true
      });
    });
  });

  describe('Computed Properties', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should compute PreorderECRList query correctly', () => {
      fixture.detectChanges();

      component.queryForm.patchValue({
        sys3800: 'A',
        sys3900: '1F'
      });

      fixture.detectChanges();

      const query = (component as any).queryPreorderECRList();
      expect(query).toEqual({
        data_type: '2',
        building_no: 'A',
        floor_no: '1F'
      });
    });

    it('should compute TLTTALENT query correctly', () => {
      fixture.detectChanges();

      component.queryForm.patchValue({
        sys3800: 'A',
        sys3900: '1F'
      });

      fixture.detectChanges();

      const query = (component as any).queryTLTTALENT();
      expect(query).toEqual({
        building_no: 'A',
        floor_no: '1F'
      });
    });

    it('should compute TLS26010 query correctly', () => {
      fixture.detectChanges();

      component.queryForm.patchValue({
        ecrNos: ['ECR001', 'ECR002'],
        tltNos: ['TLT001', 'TLT002'],
        podSdateS: '2024-01-01',
        podSdateE: '2024-01-15',
        podEdateS: '2024-01-16',
        podEdateE: '2024-01-31'
      });

      fixture.detectChanges();

      const query = (component as any).queryTLS26010();
      expect(query).toEqual({
        ECR_No: ['ECR001', 'ECR002'],
        tlt_no: ['TLT001', 'TLT002'],
        pod_sdate_S: '2024-01-01',
        pod_sdate_E: '2024-01-15',
        pod_edate_S: '2024-01-16',
        pod_edate_E: '2024-01-31'
      });
    });
  }); describe('Error Handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle service initialization without errors', () => {
      expect(() => {
        component.ngOnInit();
        fixture.detectChanges();
      }).not.toThrow();
    });
  });
});

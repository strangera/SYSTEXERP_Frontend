import { DatePipe } from '@angular/common';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TLS26010Service } from '@service/api/tls/tls26010.service';
import { DropdownOption } from '@shared/models/api/base-api.interface';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { EcrTable, TLS26010Detail, TltTable } from '../tls26010/tls26010.model';
import { TLS26010CRUComponent } from './tls26010-cru.component';

describe('TLS26010CRUComponent', () => {
  let component: TLS26010CRUComponent;
  let fixture: ComponentFixture<TLS26010CRUComponent>;
  let mockTLS26010Service: jasmine.SpyObj<TLS26010Service>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockConfirmationService: jasmine.SpyObj<ConfirmationService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  // Mock data
  const mockSYS3800Data: DropdownOption[] = [
    { No: 'A', Name: '館別A' },
    { No: 'B', Name: '館別B' }
  ];

  const mockSYS3900Data: DropdownOption[] = [
    { No: '1F', Name: '1樓' },
    { No: '2F', Name: '2樓' }
  ];

  const mockSYS3A00Data: DropdownOption[] = [
    { No: 'A1', Name: '區域A1' },
    { No: 'A2', Name: '區域A2' }
  ];

  const mockEcrData: EcrTable[] = [
    {
      ecr_no: 'ECR001',
      ecr_name: '收銀機001',
      building_no: 'A',
      building_name: '館別A',
      floor_no: '1F',
      floor_name: '1樓',
      area_no: 'A1',
      area_name: '區域A1',
      tlt_no: 'TLT001',
      tlt_name: '專櫃001',
      ecr_type: '2'
    }
  ];

  const mockTltData: TltTable[] = [
    {
      tlt_no: 'TLT001',
      tlt_name: '專櫃001',
      building_no: 'A',
      building_name: '館別A',
      floor_no: '1F',
      floor_name: '1樓',
      area_no: 'A1',
      area_name: '區域A1',
      talent_id: 1,
      ven_no: 'VEN001',
      VEN_Name: '廠商001',
      apply_no: 'APP001'
    }
  ];

  const mockTLS26010Detail: TLS26010Detail = {
    pod_info: {
      id: 1,
      pod_no: 'POD001',
      pod_desc: '測試預售活動',
      pod_sdate: new Date('2024-01-01'),
      pod_edate: new Date('2024-01-31'),
      pod_status: ApprovalStatus.未核准
    },
    ecr_list: [],
    talent_list: []
  };

  beforeEach(async () => {
    // Create spy objects
    mockTLS26010Service = jasmine.createSpyObj('TLS26010Service', [
      'loadSYS3800',
      'loadSYS3900',
      'loadSYS3A00',
      'loadPreorderECRList',
      'loadTLTTALENT',
      'loadTLS26010Detail',
      'approvalStatus'
    ]);

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);
    mockConfirmationService = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['get']);

    // Setup service spies with signals and properties
    Object.defineProperty(mockTLS26010Service, 'sys3800Data', {
      get: () => signal(mockSYS3800Data),
      configurable: true
    });
    Object.defineProperty(mockTLS26010Service, 'sys3900Data', {
      get: () => signal(mockSYS3900Data),
      configurable: true
    });
    Object.defineProperty(mockTLS26010Service, 'sys3A00Data', {
      get: () => signal(mockSYS3A00Data),
      configurable: true
    });
    Object.defineProperty(mockTLS26010Service, 'ecrData', {
      get: () => signal(mockEcrData),
      configurable: true
    });
    Object.defineProperty(mockTLS26010Service, 'tltData', {
      get: () => signal(mockTltData),
      configurable: true
    });
    Object.defineProperty(mockTLS26010Service, 'TLS26010Detail', {
      get: () => signal(mockTLS26010Detail),
      configurable: true
    });
    Object.defineProperty(mockTLS26010Service, 'tableLoading', {
      get: () => false,
      configurable: true
    });
    Object.defineProperty(mockTLS26010Service, 'dateS', {
      get: () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      configurable: true
    });
    Object.defineProperty(mockTLS26010Service, 'dateE', {
      get: () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      configurable: true
    });

    mockTLS26010Service.approvalStatus.and.returnValue('未核准');
    mockTranslateService.get.and.returnValue(of('測試文字'));

    await TestBed.configureTestingModule({
      imports: [
        TLS26010CRUComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: 'TLS26010Service', useValue: mockTLS26010Service },
        { provide: Router, useValue: mockRouter },
        { provide: MessageService, useValue: mockMessageService },
        { provide: ConfirmationService, useValue: mockConfirmationService },
        { provide: TranslateService, useValue: mockTranslateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TLS26010CRUComponent);
    component = fixture.componentInstance;

    // Mock history state for CRU operations
    Object.defineProperty(window, 'history', {
      value: {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: null,
          rowdata: null
        }
      },
      writable: true
    });
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with correct structure', () => {
      expect(component.dataForm.get('pod_no')).toBeTruthy();
      expect(component.dataForm.get('pod_desc')).toBeTruthy();
      expect(component.dataForm.get('pod_sdate')).toBeTruthy();
      expect(component.dataForm.get('pod_edate')).toBeTruthy();
      expect(component.dataForm.get('pod_busdate')).toBeTruthy();
      expect(component.dataForm.get('pod_status')).toBeTruthy();
      expect(component.dataForm.get('ecr_nos')).toBeTruthy();
      expect(component.dataForm.get('tlt_nos')).toBeTruthy();
      expect(component.dataForm.get('sys3800')).toBeTruthy();
      expect(component.dataForm.get('sys3900')).toBeTruthy();
      expect(component.dataForm.get('sys3A00')).toBeTruthy();
    });

    it('should load initial data on ngOnInit', () => {
      fixture.detectChanges();
      component.ngOnInit();

      expect(mockTLS26010Service.loadSYS3800).toHaveBeenCalled();
      expect(mockTLS26010Service.loadSYS3900).toHaveBeenCalled();
      expect(mockTLS26010Service.loadSYS3A00).toHaveBeenCalled();
    });

    it('should initialize form with default values', () => {
      expect(component.dataForm.get('pod_no')?.value).toBe('自動給號');
      expect(component.dataForm.get('pod_status')?.value).toBe('未核准');
      expect(component.dataForm.get('pod_sdate')?.value).toBeInstanceOf(Date);
      expect(component.dataForm.get('pod_edate')?.value).toEqual(component.service.dateE);
      expect(component.dataForm.get('pod_busdate')?.value).toEqual(component.service.dateE);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should validate required fields', () => {
      const podDescControl = component.dataForm.get('pod_desc');
      const podSdateControl = component.dataForm.get('pod_sdate');
      const podEdateControl = component.dataForm.get('pod_edate');
      const podBusdateControl = component.dataForm.get('pod_busdate');

      // Test required validation
      podDescControl?.setValue('');
      expect(podDescControl?.invalid).toBeTruthy();
      expect(podDescControl?.errors?.['required']).toBeTruthy();

      podSdateControl?.setValue(null);
      expect(podSdateControl?.invalid).toBeTruthy();

      podEdateControl?.setValue(null);
      expect(podEdateControl?.invalid).toBeTruthy();

      podBusdateControl?.setValue(null);
      expect(podBusdateControl?.invalid).toBeTruthy();
    });

    it('should validate maxLength for pod_desc', () => {
      const podDescControl = component.dataForm.get('pod_desc');
      const longText = 'a'.repeat(101);

      podDescControl?.setValue(longText);
      expect(podDescControl?.invalid).toBeTruthy();
      expect(podDescControl?.errors?.['maxlength']).toBeTruthy();
    });
  });

  describe('CRUD Status Handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have CRUDStatus enum available', () => {
      expect(component.CRUDStatus).toBeDefined();
      expect(component.CRUDStatus.Create).toBe(CRUDStatus.Create);
      expect(component.CRUDStatus.Read).toBe(CRUDStatus.Read);
      expect(component.CRUDStatus.Delete).toBe(CRUDStatus.Delete);
    });
  });

  describe('Dialog Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have dialog visibility signal', () => {
      expect(component.dialogVisible()).toBe(false);
    });

    it('should manage dialog data and columns', () => {
      expect(component.dialogData).toEqual([]);
      expect(component.dialogColumn).toEqual([]);
      expect(component.selectedDialogData).toEqual([]);
    });
  });

  describe('Data Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have filtered ECR and TLT tables', () => {
      expect(component.ecrTableFiltered).toEqual([]);
      expect(component.tltTableFiltered).toEqual([]);
    });

    it('should access form controls through df getter', () => {
      expect(component.df).toBeDefined();
      expect(component.df.pod_no).toBe(component.dataForm.get('pod_no') as FormControl<string | null>);
      expect(component.df.pod_desc).toBe(component.dataForm.get('pod_desc') as FormControl<string | null>);
    });
  });

  describe('Service Integration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call service methods for dropdown data loading', () => {
      component.ngOnInit();

      expect(mockTLS26010Service.loadSYS3800).toHaveBeenCalled();
      expect(mockTLS26010Service.loadSYS3900).toHaveBeenCalled();
      expect(mockTLS26010Service.loadSYS3A00).toHaveBeenCalled();
    });
  });

  describe('Date Handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle date changes properly', () => {
      const newStartDate = new Date('2024-02-01');
      const newEndDate = new Date('2024-02-28');

      component.dataForm.patchValue({
        pod_sdate: newStartDate,
        pod_edate: newEndDate
      });

      expect(component.dataForm.get('pod_sdate')?.value).toEqual(newStartDate);
      expect(component.dataForm.get('pod_edate')?.value).toEqual(newEndDate);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle initialization errors gracefully', () => {
      expect(() => {
        component.ngOnInit();
        fixture.detectChanges();
      }).not.toThrow();
    });
  });
});

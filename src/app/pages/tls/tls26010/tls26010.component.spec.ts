import { DatePipe } from '@angular/common';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { TLS26010Component } from './tls26010.component';
import { TLS26010Data } from './tls26010.model';

describe('TLS26010Component', () => {
  let component: TLS26010Component;
  let fixture: ComponentFixture<TLS26010Component>;
  let mockService: any;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockMessageService: any;
  let mockConfirmationService: any;

  const mockTLS26010Data: TLS26010Data[] = [
    {
      id: 1,
      pod_no: 'POD001',
      pod_desc: '預售活動1',
      pod_sdate: new Date('2025-01-01'),
      pod_edate: new Date('2025-01-31'),
      pod_status: '0',
      approved_date: null,
      approved_usr_name: null,
      CanDelete: '1',
      CanEdit: '1'
    }
  ];

  beforeEach(async () => {
    // Mock TLS26010Service
    mockService = {
      dateS: new Date('2025-01-01'),
      dateE: new Date('2025-12-31'),
      loadSYS3800: jasmine.createSpy('loadSYS3800'),
      loadSYS3900: jasmine.createSpy('loadSYS3900'),
      loadSYS3A00: jasmine.createSpy('loadSYS3A00'),
      loadPreorderECRList: jasmine.createSpy('loadPreorderECRList'),
      loadTLTTALENT: jasmine.createSpy('loadTLTTALENT'),
      loadTLS26010: jasmine.createSpy('loadTLS26010').and.returnValue(of(mockTLS26010Data)),
      loadApproval: jasmine.createSpy('loadApproval'),
      deleteTLS26010: jasmine.createSpy('deleteTLS26010'),
      approvalStatus: jasmine.createSpy('approvalStatus').and.returnValue('未核准'),
      sys3800List: signal([]),
      sys3900List: signal([]),
      sys3A00List: signal([]),
      ecrData: signal([]),
      tltData: signal([]),
      TLS26010List: signal(mockTLS26010Data)
    };

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockMessageService = {
      add: jasmine.createSpy('add'),
      successBubble: jasmine.createSpy('successBubble'),
      infoBubble: jasmine.createSpy('infoBubble')
    };
    mockConfirmationService = {
      confirm: jasmine.createSpy('confirm')
    };

    await TestBed.configureTestingModule({
      imports: [
        TLS26010Component,
        ReactiveFormsModule,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: 'TLS26010Service', useValue: mockService },
        { provide: Router, useValue: mockRouter },
        { provide: MessageService, useValue: mockMessageService },
        { provide: ConfirmationService, useValue: mockConfirmationService },
        { provide: TranslateService, useValue: jasmine.createSpyObj('TranslateService', ['get', 'instant']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TLS26010Component);
    component = fixture.componentInstance;

    // 手動注入 service
    (component as any).service = mockService;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with query form', () => {
    expect(component.queryForm).toBeDefined();
    expect(component.queryForm.get('sys3800')).toBeDefined();
    expect(component.queryForm.get('sys3900')).toBeDefined();
    expect(component.queryForm.get('sys3A00')).toBeDefined();
    expect(component.queryForm.get('ecrNos')).toBeDefined();
    expect(component.queryForm.get('tltNos')).toBeDefined();
    expect(component.queryForm.get('podSdateS')).toBeDefined();
    expect(component.queryForm.get('podSdateE')).toBeDefined();
    expect(component.queryForm.get('podEdateS')).toBeDefined();
    expect(component.queryForm.get('podEdateE')).toBeDefined();
  });

  it('should load services on ngOnInit', () => {
    component.ngOnInit();

    expect(mockService.loadSYS3800).toHaveBeenCalled();
    expect(mockService.loadSYS3900).toHaveBeenCalled();
    expect(mockService.loadSYS3A00).toHaveBeenCalled();
  });

  it('should clear form with onClear', () => {
    component.queryForm.patchValue({
      sys3800: ['001'],
      sys3900: ['002'],
      ecrNos: ['ECR001']
    });

    component.onClear();

    expect(component.queryForm.get('sys3800')?.value).toBeUndefined();
    expect(component.queryForm.get('sys3900')?.value).toBeUndefined();
    expect(component.queryForm.get('ecrNos')?.value).toBeUndefined();
    expect(component.queryForm.get('podSdateS')?.value).toEqual(mockService.dateS);
    expect(component.queryForm.get('podSdateE')?.value).toEqual(mockService.dateE);
  });

  it('should submit query with onSubmitQuery', () => {
    spyOn(component, 'onSubmit');

    component.queryForm.patchValue({
      podSdateS: new Date('2025-01-01'),
      podSdateE: new Date('2025-01-31'),
      podEdateS: new Date('2025-01-01'),
      podEdateE: new Date('2025-01-31')
    });

    component.onSubmitQuery();

    expect(component.onSubmit).toHaveBeenCalledWith(component.queryForm);
  });

  it('should handle delete confirmation with onDelete', () => {
    const testData = mockTLS26010Data;

    mockConfirmationService.confirm.and.callFake((options: any) => {
      options.accept();
    });

    component.onDelete(testData);

    expect(mockConfirmationService.confirm).toHaveBeenCalled();
    expect(mockService.deleteTLS26010).toHaveBeenCalledWith(testData[0]);
    expect(mockMessageService.successBubble).toHaveBeenCalledWith('刪除成功');
  });

  it('should handle delete rejection with onDelete', () => {
    const testData = mockTLS26010Data;

    mockConfirmationService.confirm.and.callFake((options: any) => {
      options.reject();
    });

    component.onDelete(testData);

    expect(mockConfirmationService.confirm).toHaveBeenCalled();
    expect(mockMessageService.infoBubble).toHaveBeenCalledWith('已取消刪除');
  });

  it('should have correct table columns configuration', () => {
    expect(component.columns).toBeDefined();
    expect(component.columns.length).toBeGreaterThan(0);

    const requiredFields = ['pod_no', 'pod_desc', 'pod_sdate', 'pod_edate', 'pod_status'];
    requiredFields.forEach(field => {
      const column = component.columns.find(col => col.field === field);
      expect(column).toBeDefined();
    });
  });

  it('should validate editDisabled function', () => {
    const approvedData: TLS26010Data = { ...mockTLS26010Data[0], pod_status: '1', CanEdit: '0' };
    const unapprovedData: TLS26010Data = { ...mockTLS26010Data[0], pod_status: '0', CanEdit: '1' };

    // 測試編輯停用邏輯
    expect(component.editDisabled(approvedData)).toBeTruthy();
    expect(component.editDisabled(unapprovedData)).toBeFalsy();
  });

  it('should have addButton configuration with approval actions', () => {
    expect(component.addButton).toBeDefined();
    expect(component.addButton.length).toBe(2);

    const approveButton = component.addButton.find(btn => btn.label === '核准');
    const rejectButton = component.addButton.find(btn => btn.label === '反核准');

    expect(approveButton).toBeDefined();
    expect(rejectButton).toBeDefined();
  });

  it('should test approval button actions', () => {
    const testData = mockTLS26010Data[0];

    const approveButton = component.addButton.find(btn => btn.label === '核准');
    if (approveButton) {
      approveButton.action(testData);
      expect(mockService.loadApproval).toHaveBeenCalledWith(testData);
    }
  });

  it('should format date columns correctly', () => {
    const datePipe = TestBed.inject(DatePipe);
    const testDate = new Date('2025-01-15');

    const podSdateColumn = component.columns.find(col => col.field === 'pod_sdate');
    expect(podSdateColumn).toBeDefined();

    if (podSdateColumn && podSdateColumn.format) {
      const formattedDate = podSdateColumn.format(testDate);
      expect(formattedDate).toBe(datePipe.transform(testDate, 'YYYY/MM/dd'));
    }
  });
});

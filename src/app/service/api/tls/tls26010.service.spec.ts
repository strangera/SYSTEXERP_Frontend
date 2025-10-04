import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DependentDataQuery, EcrTable, PodRequest, TLS26010Data, TLS26010Query, TltTable } from '@pages/tls/tls26010/tls26010.model';
import { AuthService } from '@service/system/auth.service';
import { ErrorHandlerService } from 'src/app/core/services/error-handler.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { ItemOperationStatus } from '@shared/models/system/CRUDstatus';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { ConfirmationService } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { TLS26010Service } from './tls26010.service';

describe('TLS26010Service', () => {
  let service: TLS26010Service;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let errorHandlerSpy: jasmine.SpyObj<ErrorHandlerService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let confirmationServiceSpy: jasmine.SpyObj<ConfirmationService>;

  const mockApiUrl = environment.ApiUrl;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getUserInfo']);
    const errorSpy = jasmine.createSpyObj('ErrorHandlerService', ['handleError']);
    const notificationSpy = jasmine.createSpyObj('NotificationService', ['successBubble', 'errorBubble', 'infoBubble']);
    const confirmationSpy = jasmine.createSpyObj('ConfirmationService', ['confirm']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TLS26010Service,
        { provide: AuthService, useValue: authSpy },
        { provide: ErrorHandlerService, useValue: errorSpy },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: ConfirmationService, useValue: confirmationSpy }
      ]
    });

    service = TestBed.inject(TLS26010Service);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    errorHandlerSpy = TestBed.inject(ErrorHandlerService) as jasmine.SpyObj<ErrorHandlerService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    confirmationServiceSpy = TestBed.inject(ConfirmationService) as jasmine.SpyObj<ConfirmationService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial signals defined', () => {
    expect(service.TLS26010Data()).toEqual([]);
    expect(service.TLS26010Detail()).toBeUndefined();
    expect(service.sys3800Data()).toEqual([]);
    expect(service.sys3900Data()).toEqual([]);
    expect(service.sys3A00Data()).toEqual([]);
    expect(service.ecrData()).toEqual([]);
    expect(service.tltData()).toEqual([]);
  });

  describe('loadSYS3800', () => {
    it('should load building data successfully', () => {
      const mockResponse: BaseQueryResponse<DropdownOption> = {
        Status: '0000',
        Data: [
          { No: 'A', Name: '館A' },
          { No: 'B', Name: '館B' }
        ],
        Message: 'Success',
        TotalCount: 2,
        TotalPage: 1
      };

      service.loadSYS3800();

      const req = httpMock.expectOne(`${mockApiUrl}/querySYS3800_DropDownList`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);

      expect(service.sys3800Data()).toEqual(mockResponse.Data);
    });
  });

  describe('loadSYS3900', () => {
    it('should load floor data successfully with building_no', () => {
      const mockResponse: BaseQueryResponse<DropdownOption> = {
        Status: '0000',
        Data: [
          { No: '1', Name: '1樓' },
          { No: '2', Name: '2樓' }
        ],
        Message: 'Success',
        TotalCount: 2,
        TotalPage: 1
      };

      service.loadSYS3900();

      const req = httpMock.expectOne(`${mockApiUrl}/querySYS3900_DropDownList`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);

      expect(service.sys3900Data()).toEqual(mockResponse.Data);
    });

    it('should load floor data successfully without building_no', () => {
      const mockResponse: BaseQueryResponse<DropdownOption> = {
        Status: '0000',
        Data: [],
        Message: 'Success',
        TotalCount: 0,
        TotalPage: 0
      };

      service.loadSYS3900();

      const req = httpMock.expectOne(`${mockApiUrl}/querySYS3900_DropDownList`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);

      expect(service.sys3900Data()).toEqual(mockResponse.Data);
    });
  });

  describe('loadSYS3A00', () => {
    it('should load area data successfully', () => {
      const mockResponse: BaseQueryResponse<DropdownOption> = {
        Status: '0000',
        Data: [
          { No: 'A1', Name: '區域A1' },
          { No: 'A2', Name: '區域A2' }
        ],
        Message: 'Success',
        TotalCount: 2,
        TotalPage: 1
      };

      service.loadSYS3A00();

      const req = httpMock.expectOne(`${mockApiUrl}/querySYS3A00_DropDownList`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);

      expect(service.sys3A00Data()).toEqual(mockResponse.Data);
    });
  });

  describe('loadPreorderECRList', () => {
    it('should load ECR list successfully', () => {
      const mockQuery: DependentDataQuery & { ecr_type: string; } = {
        ecr_type: '1',
        building_nos: ['A'],
        floor_nos: ['1'],
        area_nos: ['A1']
      };

      const mockEcrData: EcrTable[] = [{
        ecr_no: 'ECR001',
        ecr_name: '收銀機001',
        tlt_no: 'TLT001',
        tlt_name: '專櫃001',
        ecr_type: '1',
        area_no: 'A1',
        area_name: '區域A1',
        building_no: 'A',
        building_name: '館A',
        floor_no: '1',
        floor_name: '1樓',
        Status: ItemOperationStatus.Original
      }];

      const mockResponse: BaseQueryResponse<EcrTable> = {
        Status: '0000',
        Data: mockEcrData,
        Message: 'Success',
        TotalCount: 1,
        TotalPage: 1
      };

      service.loadPreorderECRList(mockQuery);

      const req = httpMock.expectOne(`${mockApiUrl}/queryECRDropDownList`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockQuery);
      req.flush(mockResponse);

      expect(service.ecrData()).toEqual(mockResponse.Data);
    });
  });

  describe('loadTLTTALENT', () => {
    it('should load talent list successfully', () => {
      const mockQuery: DependentDataQuery = {
        building_nos: ['A'],
        floor_nos: ['1'],
        area_nos: ['A1']
      };

      const mockTltData: TltTable[] = [{
        tlt_no: 'TLT001',
        tlt_name: '專櫃001',
        talent_id: 1,
        apply_no: 'APP001',
        VEN_Name: '廠商A',
        ven_no: 'VEN001',
        area_no: 'A1',
        area_name: '區域A1',
        building_no: 'A',
        building_name: '館A',
        floor_no: '1',
        floor_name: '1樓',
        Status: ItemOperationStatus.Original
      }];

      const mockResponse: BaseQueryResponse<TltTable> = {
        Status: '0000',
        Data: mockTltData,
        Message: 'Success',
        TotalCount: 1,
        TotalPage: 1
      };

      service.loadTLTTALENT(mockQuery);

      const req = httpMock.expectOne(`${mockApiUrl}/queryTalentDropDownList`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockQuery);
      req.flush(mockResponse);

      expect(service.tltData()).toEqual(mockResponse.Data);
    });
  });

  describe('loadTLS26010', () => {
    it('should load TLS26010 data successfully', () => {
      const mockQuery: TLS26010Query = {
        ecr_nos: ['ECR001'],
        tlt_nos: ['TLT001'],
        pod_sdate_S: new Date('2024-01-01'),
        pod_sdate_E: new Date('2024-01-31'),
        pod_edate_S: new Date('2024-02-01'),
        pod_edate_E: new Date('2024-02-28')
      };

      const mockData: TLS26010Data[] = [{
        id: 1,
        pod_no: 'POD001',
        pod_desc: '測試活動',
        pod_sdate: new Date('2024-01-01'),
        pod_edate: new Date('2024-01-31'),
        pod_status: ApprovalStatus.未核准,
        CanEdit: '1',
        CanDelete: '1',
        approved_date: null,
        approved_usr_name: null,
        ecr_nos: ['ECR001'],
        tlt_nos: ['TLT001'],
        area_no: 'A1',
        build_no: 'A',
        floor_no: '1',
        talent_id: 1
      }];

      const mockResponse: BaseQueryResponse<TLS26010Data> = {
        Status: '0000',
        Data: mockData,
        Message: 'Success',
        TotalCount: 1,
        TotalPage: 1
      };

      service.loadTLS26010(mockQuery);

      const req = httpMock.expectOne(`${mockApiUrl}/TLS0000/TLS2000/queryTLS26010`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockQuery);
      req.flush(mockResponse);

      expect(service.TLS26010Data()).toEqual(mockResponse.Data);
    });
  });

  describe('insertTLS26010', () => {
    it('should insert TLS26010 data successfully', () => {
      const mockPayload: PodRequest = {
        pod_info: {
          pod_desc: '新活動',
          pod_sdate: new Date('2024-01-01'),
          pod_edate: new Date('2024-01-31'),
          pod_status: ApprovalStatus.未核准
        },
        ecr_list: [{
          ecr_no: 'ECR001',
          ecr_name: '收銀機001',
          tlt_no: 'TLT001',
          tlt_name: '專櫃001',
          Status: ItemOperationStatus.New
        }],
        talent_list: [{
          tlt_no: 'TLT001',
          tlt_name: '專櫃001',
          Status: ItemOperationStatus.New
        }]
      };

      const mockResponse: BaseQueryResponse<any> = {
        Status: '0000',
        Message: 'Created successfully',
        Data: [{ id: 1 }],
        TotalCount: 0,
        TotalPage: 0
      };

      service.insertTLS26010(mockPayload).subscribe(response => {
        expect(response.Status).toBe('0000');
        expect(response.Data[0].id).toBe(1);
      });

      const req = httpMock.expectOne(`${mockApiUrl}/TLS0000/TLS2000/insertTLS26010`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockPayload);
      req.flush(mockResponse);
    });
  });

  describe('updateTLS26010', () => {
    it('should update TLS26010 data successfully', () => {
      const mockPayload: PodRequest = {
        pod_info: {
          id: 1,
          pod_no: 'POD001',
          pod_desc: '更新活動',
          pod_sdate: new Date('2024-01-01'),
          pod_edate: new Date('2024-01-31'),
          pod_status: ApprovalStatus.已核准
        },
        ecr_list: [{
          id: 1,
          ecr_no: 'ECR001',
          ecr_name: '收銀機001',
          tlt_no: 'TLT001',
          tlt_name: '專櫃001',
          Status: ItemOperationStatus.Modified
        }],
        talent_list: [{
          id: 1,
          tlt_no: 'TLT001',
          tlt_name: '專櫃001',
          Status: ItemOperationStatus.Modified
        }]
      };

      const mockResponse: BaseQueryResponse<any> = {
        Status: '0000',
        Message: 'Updated successfully',
        Data: [],
        TotalCount: 0,
        TotalPage: 0
      };

      // 設置初始數據
      service.TLS26010Data.set([{
        id: 1,
        pod_no: 'POD001',
        pod_desc: '原始活動',
        pod_sdate: new Date('2024-01-01'),
        pod_edate: new Date('2024-01-31'),
        pod_status: ApprovalStatus.未核准,
        CanEdit: '1',
        CanDelete: '1',
        approved_date: null,
        approved_usr_name: null
      }]);

      service.updateTLS26010(mockPayload).subscribe(response => {
        expect(response.Status).toBe('0000');
      });

      const req = httpMock.expectOne(`${mockApiUrl}/TLS0000/TLS2000/updateTLS26010`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockPayload);
      req.flush(mockResponse);
    });
  });

  describe('deleteTLS26010', () => {
    it('should delete TLS26010 data successfully', () => {
      const mockData: TLS26010Data = {
        id: 1,
        pod_no: 'POD001',
        pod_desc: '測試活動',
        pod_sdate: new Date('2024-01-01'),
        pod_edate: new Date('2024-01-31'),
        pod_status: ApprovalStatus.未核准,
        CanEdit: '1',
        CanDelete: '1',
        approved_date: null,
        approved_usr_name: null
      };

      const mockResponse: BaseQueryResponse<any> = {
        Status: '0000',
        Message: 'Deleted successfully',
        Data: [],
        TotalCount: 0,
        TotalPage: 0
      };

      service.deleteTLS26010(mockData);

      const req = httpMock.expectOne(`${mockApiUrl}/TLS0000/TLS2000/deleteTLS26010`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ id: mockData.id });
      req.flush(mockResponse);
    });
  });

  describe('loadApproval', () => {
    it('should approve data when confirmed', () => {
      const mockData: TLS26010Data = {
        id: 1,
        pod_no: 'POD001',
        pod_desc: '測試活動',
        pod_sdate: new Date('2024-01-01'),
        pod_edate: new Date('2024-01-31'),
        pod_status: ApprovalStatus.未核准,
        CanEdit: '1',
        CanDelete: '1',
        approved_date: null,
        approved_usr_name: null
      };

      const mockUserInfo = {
        AccessToken: 'token',
        SYS_StoreNo: 'store001',
        USER_PwdExpireDate: '2025-12-31',
        id: 1,
        mid: 'mall001',
        user_Name: '測試用戶',
        user_No: 'USR001',
        user_email: 'test@example.com',
        client_ip: '127.0.0.1',
        STR_Uniform: '12345678'
      };
      authServiceSpy.getUserInfo.and.returnValue(mockUserInfo);

      // 模擬確認對話框接受
      confirmationServiceSpy.confirm.and.callFake((options: any) => {
        if (options.accept) {
          options.accept();
        }
        return confirmationServiceSpy;
      });

      const mockResponse: BaseQueryResponse<{ Status: ApprovalStatus; }> = {
        Status: '0000',
        Message: 'Approved successfully',
        Data: [{ Status: ApprovalStatus.已核准 }],
        TotalCount: 0,
        TotalPage: 0
      };

      // 設置初始數據
      service.TLS26010Data.set([mockData]);

      service.loadApproval(mockData);

      const req = httpMock.expectOne(`${mockApiUrl}/TLS0000/TLS2000/approveTLS26010`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ id: mockData.id });
      req.flush(mockResponse);

      expect(confirmationServiceSpy.confirm).toHaveBeenCalled();
      expect(notificationServiceSpy.successBubble).toHaveBeenCalledWith('核准成功');
    });
  });

  describe('approvalStatus', () => {
    it('should return correct approval status text', () => {
      expect(service.approvalStatus(ApprovalStatus.未核准)).toBe('未核准');
      expect(service.approvalStatus(ApprovalStatus.已核准)).toBe('已核准');
      expect(service.approvalStatus(ApprovalStatus.刪除)).toBe('刪除');
      expect(service.approvalStatus('unknown')).toBe('unknown');
    });
  });

  describe('isRowSelectable', () => {
    it('should return true for deletable row', () => {
      const rowData: TLS26010Data = {
        id: 1,
        pod_no: 'POD001',
        pod_desc: '測試活動',
        pod_sdate: new Date(),
        pod_edate: new Date(),
        pod_status: ApprovalStatus.已核准,
        CanEdit: '1',
        CanDelete: '1',
        approved_date: null,
        approved_usr_name: null
      };

      expect(service.isRowSelectable(rowData)).toBe(true);
    });

    it('should return true for unapproved row', () => {
      const rowData: TLS26010Data = {
        id: 1,
        pod_no: 'POD001',
        pod_desc: '測試活動',
        pod_sdate: new Date(),
        pod_edate: new Date(),
        pod_status: ApprovalStatus.未核准,
        CanEdit: '0',
        CanDelete: '0',
        approved_date: null,
        approved_usr_name: null
      };

      expect(service.isRowSelectable(rowData)).toBe(true);
    });

    it('should return false for non-deletable approved row', () => {
      const rowData: TLS26010Data = {
        id: 1,
        pod_no: 'POD001',
        pod_desc: '測試活動',
        pod_sdate: new Date(),
        pod_edate: new Date(),
        pod_status: ApprovalStatus.已核准,
        CanEdit: '0',
        CanDelete: '0',
        approved_date: null,
        approved_usr_name: null
      };

      expect(service.isRowSelectable(rowData)).toBe(false);
    });
  });

  describe('shallowEqual', () => {
    it('should return true for equal objects', () => {
      const objA = { a: 1, b: 2 };
      const objB = { a: 1, b: 2 };
      expect(service.shallowEqual(objA, objB)).toBe(true);
    });

    it('should return false for different objects', () => {
      const objA = { a: 1, b: 2 };
      const objB = { a: 1, b: 3 };
      expect(service.shallowEqual(objA, objB)).toBe(false);
    });
  });
});

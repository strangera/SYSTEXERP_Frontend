import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseQueryResponse } from '../../../shared/models/api/base-api.interface';
import { ECRNoService } from '../../basic/ECRNo.service';
import { ErrorHandlerService } from '../../system/error-handler.service';
import { PreorderECRListQuery, TLS26010, TLS26010Query, TLS26010Service, TLTTALENTQuery } from './tls26010.service';

interface Data {
  No: string;
  Name: string;
}

describe('TLS26010Service', () => {
  let service: TLS26010Service;
  let httpMock: HttpTestingController;
  let errorHandlerServiceSpy: jasmine.SpyObj<ErrorHandlerService>;
  let ecrNoServiceSpy: jasmine.SpyObj<ECRNoService>;

  beforeEach(() => {
    const errorHandlerSpy = jasmine.createSpyObj('ErrorHandlerService', ['handleError']);
    const ecrNoSpy = jasmine.createSpyObj('ECRNoService', ['getECRNo']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TLS26010Service,
        { provide: ErrorHandlerService, useValue: errorHandlerSpy },
        { provide: ECRNoService, useValue: ecrNoSpy }
      ]
    });

    service = TestBed.inject(TLS26010Service);
    httpMock = TestBed.inject(HttpTestingController);
    errorHandlerServiceSpy = TestBed.inject(ErrorHandlerService) as jasmine.SpyObj<ErrorHandlerService>;
    ecrNoServiceSpy = TestBed.inject(ECRNoService) as jasmine.SpyObj<ECRNoService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('computed signals', () => {
    it('should return formatted sys3800List', () => {
      // 透過私有屬性設置測試資料
      (service as any).sys3800Data.set([
        { No: '01', Name: '館別A' },
        { No: '02', Name: '館別B' }
      ]);

      const result = service.sys3800List();
      expect(result).toEqual([
        { label: '館別A', value: '01' },
        { label: '館別B', value: '02' }
      ]);
    });

    it('should return formatted sys3900List', () => {
      (service as any).sys3900Data.set([
        { No: '1F', Name: '1樓' },
        { No: '2F', Name: '2樓' }
      ]);

      const result = service.sys3900List();
      expect(result).toEqual([
        { label: '1樓', value: '1F' },
        { label: '2樓', value: '2F' }
      ]);
    });

    it('should return TLTTALENTList', () => {
      (service as any).TLTTALENTData.set([
        { No: 'T001', Name: '專櫃A' },
        { No: 'T002', Name: '專櫃B' }
      ]);

      const result = service.TLTTALENTList();
      expect(result).toEqual([
        { label: '專櫃A', value: 'T001' },
        { label: '專櫃B', value: 'T002' }
      ]);
    });

    it('should return TLS26010List', () => {
      const mockData: TLS26010[] = [{
        Data: [{ pod_no: 'P001', pod_desc: '活動1', pod_sdate: '2025-01-01', pod_edate: '2025-01-31' }],
        pod_status: 'A',
        approved_usr_name: 'test_user',
        approved_date: '2025-01-01'
      }];

      (service as any).TLS26010Data.set(mockData);
      const result = service.TLS26010List();
      expect(result).toEqual(mockData);
    });
  });

  describe('loadSYS3800', () => {
    it('should load SYS3800 data successfully', () => {
      const mockQuery = { test: 'query' };
      const mockResponse: BaseQueryResponse<Data> = {
        Status: '0000',
        Data: [
          { No: '01', Name: '館別A' },
          { No: '02', Name: '館別B' }
        ],
        Meta: { Timestamp: '', RequestId: '' },
        Message: '',
        TotalCount: 2,
        TotalPage: 1
      };

      spyOn(console, 'log');
      service.loadSYS3800(mockQuery);

      const req = httpMock.expectOne(`${environment.ApiUrl}/querySYS3800_DropDownList`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockQuery);
      req.flush(mockResponse);

      expect(service.sys3800List()).toEqual([
        { label: '館別A', value: '01' },
        { label: '館別B', value: '02' }
      ]);
      expect(console.log).toHaveBeenCalledWith('館別查詢結果:', mockResponse.Data);
    });

    it('should handle loading state correctly', () => {
      const mockQuery = { test: 'query' };

      // 第一次呼叫應該執行
      service.loadSYS3800(mockQuery);
      expect((service as any).sys3800Loading).toBe(true);

      // 第二次呼叫應該被忽略
      service.loadSYS3800(mockQuery);

      // 只應該有一個 HTTP 請求
      httpMock.expectOne(`${environment.ApiUrl}/querySYS3800_DropDownList`);
    });

    it('should handle error', () => {
      const mockQuery = { test: 'query' };
      const mockError = new Error('API Error');

      errorHandlerServiceSpy.handleError.and.returnValue(throwError(() => mockError));

      service.loadSYS3800(mockQuery);

      const req = httpMock.expectOne(`${environment.ApiUrl}/querySYS3800_DropDownList`);
      req.error(new ProgressEvent('error'));

      expect(errorHandlerServiceSpy.handleError).toHaveBeenCalled();
    });
  });

  describe('loadSYS3900', () => {
    it('should load SYS3900 data successfully', () => {
      const mockQuery = { building_no: '01' };
      const mockResponse: BaseQueryResponse<Data> = {
        Status: '0000',
        Data: [
          { No: '1F', Name: '1樓' },
          { No: '2F', Name: '2樓' }
        ],
        Meta: { Timestamp: '', RequestId: '' },
        Message: '',
        TotalCount: 2,
        TotalPage: 1
      };

      spyOn(console, 'log');
      service.loadSYS3900(mockQuery);

      const req = httpMock.expectOne(`${environment.ApiUrl}/querySYS3900_DropDownList`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockQuery);
      req.flush(mockResponse);

      expect(service.sys3900List()).toEqual([
        { label: '1樓', value: '1F' },
        { label: '2樓', value: '2F' }
      ]);
      expect(console.log).toHaveBeenCalledWith('樓層查詢結果:', mockResponse.Data);
    });

    it('should handle error', () => {
      const mockQuery = { building_no: '01' };
      const mockError = new Error('API Error');

      errorHandlerServiceSpy.handleError.and.returnValue(throwError(() => mockError));

      service.loadSYS3900(mockQuery);

      const req = httpMock.expectOne(`${environment.ApiUrl}/querySYS3900_DropDownList`);
      req.error(new ProgressEvent('error'));

      expect(errorHandlerServiceSpy.handleError).toHaveBeenCalled();
    });
  });

  describe('loadPreorderECRList', () => {
    it('should load preorder ECR data successfully', () => {
      const mockQuery: PreorderECRListQuery = {
        data_type: '1',
        building_no: '01',
        floor_no: '1F'
      };
      const mockECRData: Data[] = [
        { No: 'ECR001', Name: '收銀機001' },
        { No: 'ECR002', Name: '收銀機002' }
      ];

      spyOn(console, 'log');
      ecrNoServiceSpy.getECRNo.and.returnValue(of(mockECRData));

      service.loadPreorderECRList(mockQuery);

      expect(ecrNoServiceSpy.getECRNo).toHaveBeenCalled();
      // preorderECRList 直接返回原始數據，不進行格式轉換
      expect(service.preorderECRList()).toEqual(mockECRData);
      expect(console.log).toHaveBeenCalledWith('loadPreorderECRList:', [false, mockQuery]);
      expect(console.log).toHaveBeenCalledWith('收銀機號查詢結果:', mockECRData);
    });

    it('should return early if building_no and floor_no are empty', () => {
      const mockQuery: PreorderECRListQuery = {
        data_type: '1',
        building_no: '',
        floor_no: ''
      };

      service.loadPreorderECRList(mockQuery);

      expect(ecrNoServiceSpy.getECRNo).not.toHaveBeenCalled();
    });

    it('should handle loading state correctly', () => {
      const mockQuery: PreorderECRListQuery = {
        data_type: '1',
        building_no: '01',
        floor_no: '1F'
      };

      ecrNoServiceSpy.getECRNo.and.returnValue(of([]));

      // 第一次呼叫應該執行
      service.loadPreorderECRList(mockQuery);
      expect((service as any).preorderECRLoading).toBe(true);

      // 第二次呼叫應該被忽略（因為 loading 狀態）
      service.loadPreorderECRList(mockQuery);

      // 只應該呼叫一次
      expect(ecrNoServiceSpy.getECRNo).toHaveBeenCalledTimes(1);
    });

    it('should handle error', () => {
      const mockQuery: PreorderECRListQuery = {
        data_type: '1',
        building_no: '01',
        floor_no: '1F'
      };
      const mockError = new Error('ECR Service Error');

      errorHandlerServiceSpy.handleError.and.returnValue(throwError(() => mockError));
      ecrNoServiceSpy.getECRNo.and.returnValue(throwError(() => mockError));

      service.loadPreorderECRList(mockQuery);

      expect(errorHandlerServiceSpy.handleError).toHaveBeenCalled();
    });
  });

  describe('loadTLTTALENT', () => {
    it('should load TLTTALENT data successfully', () => {
      const mockQuery: TLTTALENTQuery = {
        building_no: '01',
        floor_no: '1F'
      };
      const mockResponse: BaseQueryResponse<Data> = {
        Status: '0000',
        Data: [
          { No: 'T001', Name: '專櫃A' },
          { No: 'T002', Name: '專櫃B' }
        ],
        Meta: { Timestamp: '', RequestId: '' },
        Message: '',
        TotalCount: 2,
        TotalPage: 1
      };

      spyOn(console, 'log');
      service.loadTLTTALENT(mockQuery);

      const req = httpMock.expectOne(`${environment.ApiUrl}/queryTLTTALENT_DropDownList`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockQuery);
      req.flush(mockResponse);

      expect(service.TLTTALENTList()).toEqual([
        { label: '專櫃A', value: 'T001' },
        { label: '專櫃B', value: 'T002' }
      ]);
      expect(console.log).toHaveBeenCalledWith('loadTLTTALENT:', [false, mockQuery]);
      expect(console.log).toHaveBeenCalledWith('專櫃編號查詢結果:', mockResponse.Data);
    });

    it('should return early if building_no and floor_no are empty', () => {
      const mockQuery: TLTTALENTQuery = {
        building_no: '',
        floor_no: ''
      };

      service.loadTLTTALENT(mockQuery);

      httpMock.expectNone(`${environment.ApiUrl}/queryTLTTALENT_DropDownList`);
    });

    it('should clear data before setting new data', () => {
      const mockQuery: TLTTALENTQuery = {
        building_no: '01',
        floor_no: '1F'
      };

      // 設置初始資料
      (service as any).TLTTALENTData.set([{ No: 'OLD', Name: 'Old Data' }]);

      service.loadTLTTALENT(mockQuery);

      const req = httpMock.expectOne(`${environment.ApiUrl}/queryTLTTALENT_DropDownList`);

      // 檢查資料是否先被清空
      expect(service.TLTTALENTList()).toEqual([]);

      req.flush({
        Status: '0000',
        Data: [{ No: 'T001', Name: '專櫃A' }],
        Meta: { Timestamp: '', RequestId: '' },
        Message: '',
        TotalCount: 1,
        TotalPage: 1
      });

      expect(service.TLTTALENTList()).toEqual([{ label: '專櫃A', value: 'T001' }]);
    });
  });

  describe('loadTLS26010', () => {
    it('should load TLS26010 data successfully', () => {
      const mockQuery: TLS26010Query = {
        ECR_No: ['ECR001'],
        tlt_no: ['T001'],
        pod_sdate_S: '2025-01-01',
        pod_sdate_E: '2025-01-31',
        pod_edate_S: '2025-01-01',
        pod_edate_E: '2025-01-31'
      };
      const mockTLS26010Data: TLS26010[] = [{
        Data: [{ pod_no: 'P001', pod_desc: '活動1', pod_sdate: '2025-01-01', pod_edate: '2025-01-31' }],
        pod_status: 'A',
        approved_usr_name: 'test_user',
        approved_date: '2025-01-01'
      }];
      const mockResponse: BaseQueryResponse<TLS26010> = {
        Status: '0000',
        Data: mockTLS26010Data,
        Meta: { Timestamp: '', RequestId: '' },
        Message: '',
        TotalCount: 1,
        TotalPage: 1
      };

      spyOn(console, 'log');
      service.loadTLS26010(mockQuery);

      const req = httpMock.expectOne(`${environment.ApiUrl}/queryTLS26010`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockQuery);
      req.flush(mockResponse);

      expect(service.TLS26010List()).toEqual(mockTLS26010Data);
      expect(console.log).toHaveBeenCalledWith('loadTLS26010:', [false, mockQuery]);
      expect(console.log).toHaveBeenCalledWith('預購活動檔期查詢結果:', mockTLS26010Data);
    });

    it('should handle loading state correctly', () => {
      const mockQuery: TLS26010Query = {
        ECR_No: ['ECR001'],
        tlt_no: ['T001'],
        pod_sdate_S: '2025-01-01',
        pod_sdate_E: '2025-01-31',
        pod_edate_S: '2025-01-01',
        pod_edate_E: '2025-01-31'
      };

      // 第一次呼叫應該執行
      service.loadTLS26010(mockQuery);
      expect((service as any).TLS26010Loading).toBe(true);

      // 第二次呼叫應該被忽略
      service.loadTLS26010(mockQuery);

      // 只應該有一個 HTTP 請求
      httpMock.expectOne(`${environment.ApiUrl}/queryTLS26010`);
    });

    it('should handle error', () => {
      const mockQuery: TLS26010Query = {
        ECR_No: ['ECR001'],
        tlt_no: ['T001'],
        pod_sdate_S: '2025-01-01',
        pod_sdate_E: '2025-01-31',
        pod_edate_S: '2025-01-01',
        pod_edate_E: '2025-01-31'
      };
      const mockError = new Error('API Error');

      errorHandlerServiceSpy.handleError.and.returnValue(throwError(() => mockError));

      service.loadTLS26010(mockQuery);

      const req = httpMock.expectOne(`${environment.ApiUrl}/queryTLS26010`);
      req.error(new ProgressEvent('error'));

      expect(errorHandlerServiceSpy.handleError).toHaveBeenCalled();
    });
  });

  describe('clearData', () => {
    it('should clear TLS26010 data', () => {
      // 設置初始資料
      const mockData: TLS26010[] = [{
        Data: [{ pod_no: 'P001', pod_desc: '活動1', pod_sdate: '2025-01-01', pod_edate: '2025-01-31' }],
        pod_status: 'A',
        approved_usr_name: 'test_user',
        approved_date: '2025-01-01'
      }];
      (service as any).TLS26010Data.set(mockData);

      expect(service.TLS26010List()).toEqual(mockData);

      service.clearData();

      expect(service.TLS26010List()).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty response data', () => {
      const mockQuery = { test: 'query' };
      const mockResponse: BaseQueryResponse<Data> = {
        Status: '0000',
        Data: [],
        Meta: { Timestamp: '', RequestId: '' },
        Message: '',
        TotalCount: 0,
        TotalPage: 0
      };

      service.loadSYS3800(mockQuery);

      const req = httpMock.expectOne(`${environment.ApiUrl}/querySYS3800_DropDownList`);
      req.flush(mockResponse);

      expect(service.sys3800List()).toEqual([]);
    });

    it('should handle null or undefined Name in data', () => {
      const mockQuery = { test: 'query' };
      const mockResponse: BaseQueryResponse<Data> = {
        Status: '0000',
        Data: [
          { No: '01', Name: null as any },
          { No: '02', Name: undefined as any },
          { No: '03', Name: '館別C' }
        ],
        Meta: { Timestamp: '', RequestId: '' },
        Message: '',
        TotalCount: 3,
        TotalPage: 1
      };

      service.loadSYS3800(mockQuery);

      const req = httpMock.expectOne(`${environment.ApiUrl}/querySYS3800_DropDownList`);
      req.flush(mockResponse);

      expect(service.sys3800List()).toEqual([
        { label: '', value: '01' },
        { label: '', value: '02' },
        { label: '館別C', value: '03' }
      ]);
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E020CRUComponent } from './tls2e020-cru.component';

describe('TLS2E020CRUComponent', () => {
  let component: TLS2E020CRUComponent;
  let fixture: ComponentFixture<TLS2E020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

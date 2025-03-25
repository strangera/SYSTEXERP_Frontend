import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS56020CRUComponent } from './tls56020-cru.component';

describe('TLS56020CRUComponent', () => {
  let component: TLS56020CRUComponent;
  let fixture: ComponentFixture<TLS56020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS56020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS56020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

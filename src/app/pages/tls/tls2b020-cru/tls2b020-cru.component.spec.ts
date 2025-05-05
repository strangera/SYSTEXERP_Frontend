import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2B020CRUComponent } from './tls2b020-cru.component';

describe('TLS2B020CRUComponent', () => {
  let component: TLS2B020CRUComponent;
  let fixture: ComponentFixture<TLS2B020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2B020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2B020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

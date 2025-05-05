import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2H020CRUComponent } from './tls2h020-cru.component';

describe('TLS2H020CRUComponent', () => {
  let component: TLS2H020CRUComponent;
  let fixture: ComponentFixture<TLS2H020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2H020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2H020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

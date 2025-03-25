import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS27020CRUComponent } from './tls27020-cru.component';

describe('TLS27020CRUComponent', () => {
  let component: TLS27020CRUComponent;
  let fixture: ComponentFixture<TLS27020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS27020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS27020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS55020CRUComponent } from './tls55020-cru.component';

describe('TLS55020CRUComponent', () => {
  let component: TLS55020CRUComponent;
  let fixture: ComponentFixture<TLS55020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS55020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS55020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS55010CRUComponent } from './tls55010-cru.component';

describe('TLS55010CRUComponent', () => {
  let component: TLS55010CRUComponent;
  let fixture: ComponentFixture<TLS55010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS55010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS55010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

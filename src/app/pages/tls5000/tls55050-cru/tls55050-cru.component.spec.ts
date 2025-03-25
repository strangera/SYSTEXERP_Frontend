import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS55050CRUComponent } from './tls55050-cru.component';

describe('TLS55050CRUComponent', () => {
  let component: TLS55050CRUComponent;
  let fixture: ComponentFixture<TLS55050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS55050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS55050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

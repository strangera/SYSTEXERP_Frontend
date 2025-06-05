import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS55040CRUComponent } from './tls55040-cru.component';

describe('TLS55040CRUComponent', () => {
  let component: TLS55040CRUComponent;
  let fixture: ComponentFixture<TLS55040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS55040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS55040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

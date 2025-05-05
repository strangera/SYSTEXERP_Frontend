import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS55030CRUComponent } from './tls55030-cru.component';

describe('TLS55030CRUComponent', () => {
  let component: TLS55030CRUComponent;
  let fixture: ComponentFixture<TLS55030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS55030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS55030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

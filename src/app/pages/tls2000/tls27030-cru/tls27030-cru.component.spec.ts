import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS27030CRUComponent } from './tls27030-cru.component';

describe('TLS27030CRUComponent', () => {
  let component: TLS27030CRUComponent;
  let fixture: ComponentFixture<TLS27030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS27030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS27030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

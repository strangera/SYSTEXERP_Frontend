import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS21010CRUComponent } from './tls21010-cru.component';

describe('TLS21010CRUComponent', () => {
  let component: TLS21010CRUComponent;
  let fixture: ComponentFixture<TLS21010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS21010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS21010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

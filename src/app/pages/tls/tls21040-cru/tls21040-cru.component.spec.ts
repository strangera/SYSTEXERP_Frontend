import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS21040CRUComponent } from './tls21040-cru.component';

describe('TLS21040CRUComponent', () => {
  let component: TLS21040CRUComponent;
  let fixture: ComponentFixture<TLS21040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS21040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS21040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

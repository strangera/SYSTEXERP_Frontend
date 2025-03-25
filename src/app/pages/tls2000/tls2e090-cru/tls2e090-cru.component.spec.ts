import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E090CRUComponent } from './tls2e090-cru.component';

describe('TLS2E090CRUComponent', () => {
  let component: TLS2E090CRUComponent;
  let fixture: ComponentFixture<TLS2E090CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E090CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E090CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

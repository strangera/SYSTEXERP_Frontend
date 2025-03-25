import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E040CRUComponent } from './tls2e040-cru.component';

describe('TLS2E040CRUComponent', () => {
  let component: TLS2E040CRUComponent;
  let fixture: ComponentFixture<TLS2E040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

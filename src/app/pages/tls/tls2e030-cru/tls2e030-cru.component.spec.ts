import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E030CRUComponent } from './tls2e030-cru.component';

describe('TLS2E030CRUComponent', () => {
  let component: TLS2E030CRUComponent;
  let fixture: ComponentFixture<TLS2E030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

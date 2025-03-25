import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E050CRUComponent } from './tls2e050-cru.component';

describe('TLS2E050CRUComponent', () => {
  let component: TLS2E050CRUComponent;
  let fixture: ComponentFixture<TLS2E050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

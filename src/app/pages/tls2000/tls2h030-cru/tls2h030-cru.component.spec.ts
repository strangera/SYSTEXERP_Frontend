import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2H030CRUComponent } from './tls2h030-cru.component';

describe('TLS2H030CRUComponent', () => {
  let component: TLS2H030CRUComponent;
  let fixture: ComponentFixture<TLS2H030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2H030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2H030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

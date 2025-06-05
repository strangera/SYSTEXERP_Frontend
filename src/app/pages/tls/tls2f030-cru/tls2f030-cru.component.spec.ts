import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2F030CRUComponent } from './tls2f030-cru.component';

describe('TLS2F030CRUComponent', () => {
  let component: TLS2F030CRUComponent;
  let fixture: ComponentFixture<TLS2F030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2F030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2F030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

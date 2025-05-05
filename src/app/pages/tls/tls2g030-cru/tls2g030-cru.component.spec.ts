import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2G030CRUComponent } from './tls2g030-cru.component';

describe('TLS2G030CRUComponent', () => {
  let component: TLS2G030CRUComponent;
  let fixture: ComponentFixture<TLS2G030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2G030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2G030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

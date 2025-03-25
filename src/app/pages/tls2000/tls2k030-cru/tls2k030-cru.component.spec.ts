import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2K030CRUComponent } from './tls2k030-cru.component';

describe('TLS2K030CRUComponent', () => {
  let component: TLS2K030CRUComponent;
  let fixture: ComponentFixture<TLS2K030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2K030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2K030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

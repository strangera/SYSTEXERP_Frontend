import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2K050CRUComponent } from './tls2k050-cru.component';

describe('TLS2K050CRUComponent', () => {
  let component: TLS2K050CRUComponent;
  let fixture: ComponentFixture<TLS2K050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2K050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2K050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2A050CRUComponent } from './tls2a050-cru.component';

describe('TLS2A050CRUComponent', () => {
  let component: TLS2A050CRUComponent;
  let fixture: ComponentFixture<TLS2A050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2A050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2A050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
